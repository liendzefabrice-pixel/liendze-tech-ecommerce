#!/usr/bin/env node

const { createStrapi } = require('@strapi/strapi');

const args = new Set(process.argv.slice(2));
const shouldApply = args.has('--apply');
const shouldVerbose = args.has('--verbose');
const limitArg = process.argv.slice(2).find((arg) => arg.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.split('=')[1]) : null;

if (limitArg && (!Number.isInteger(limit) || limit <= 0)) {
  console.error('Invalid --limit value. Use a positive integer, for example --limit=25.');
  process.exit(1);
}

const main = async () => {
  const strapi = createStrapi({ distDir: 'dist' });

  try {
    await strapi.load();

    const availableColumns = await getOrderTableColumns(strapi);
    const legacyColumns = [
      'customer_name',
      'customer_email',
      'customer_phone',
      'shipping_address',
      'shipping_city',
      'notes',
    ];
    const missingLegacyColumns = legacyColumns.filter((column) => !availableColumns.includes(column));

    if (missingLegacyColumns.length > 0) {
      console.log('Legacy order columns are not present in the current database schema.');
      console.log(`Missing columns: ${missingLegacyColumns.join(', ')}`);
      console.log(
        'This means the database has already been synced to the new schema. Migrate from a backup that still contains the legacy columns, or restore them before running this script.'
      );
      return;
    }

    const rows = await strapi.db.connection('orders')
      .select(
        'id',
        'document_id',
        'locale',
        'customer_name',
        'customer_email',
        'customer_phone',
        'shipping_address',
        'shipping_city',
        'notes'
      )
      .modify((query) => {
        if (limit) {
          query.limit(limit);
        }
      })
      .orderBy('id', 'asc');

    const summary = {
      scanned: rows.length,
      migrated: 0,
      skippedNoLegacyData: 0,
      skippedExistingDeliveryInfo: 0,
      failed: 0,
    };

    console.log(
      shouldApply
        ? `Running order delivery-info migration on ${rows.length} order(s).`
        : `Dry run: inspected ${rows.length} order(s). Re-run with --apply to persist changes.`
    );

    for (const row of rows) {
      let legacyDeliveryInfo;

      try {
        legacyDeliveryInfo = buildLegacyDeliveryInfo(row);
      } catch (error) {
        summary.failed += 1;
        console.error(error instanceof Error ? error.message : error);
        continue;
      }

      if (!legacyDeliveryInfo) {
        summary.skippedNoLegacyData += 1;

        if (shouldVerbose) {
          console.log(`[skip:no-legacy-data] order #${row.id}`);
        }

        continue;
      }

      const document = await strapi.documents('api::order.order').findFirst({
        filters: { documentId: row.document_id },
        locale: row.locale || undefined,
        populate: {
          delivery_info: true,
        },
      });

      if (!document) {
        summary.failed += 1;
        console.error(`[error:not-found] order #${row.id} documentId=${row.document_id}`);
        continue;
      }

      if (hasDeliveryInfo(document.delivery_info)) {
        summary.skippedExistingDeliveryInfo += 1;

        if (shouldVerbose) {
          console.log(`[skip:already-migrated] order #${row.id} documentId=${row.document_id}`);
        }

        continue;
      }

      if (shouldApply) {
        await strapi.documents('api::order.order').update({
          documentId: row.document_id,
          locale: row.locale || undefined,
          data: {
            delivery_info: legacyDeliveryInfo,
          },
        });
      }

      summary.migrated += 1;

      console.log(
        `${shouldApply ? '[migrated]' : '[dry-run]'} order #${row.id} documentId=${row.document_id}`
      );
    }

    console.log('\nSummary');
    console.log(`scanned: ${summary.scanned}`);
    console.log(`migrated${shouldApply ? '' : ' (would migrate)'}: ${summary.migrated}`);
    console.log(`skipped_no_legacy_data: ${summary.skippedNoLegacyData}`);
    console.log(`skipped_existing_delivery_info: ${summary.skippedExistingDeliveryInfo}`);
    console.log(`failed: ${summary.failed}`);
  } finally {
    await strapi.destroy();
  }
};

const buildLegacyDeliveryInfo = (row) => {
  const fullName = normalizeText(row.customer_name);
  const email = normalizeText(row.customer_email);
  const phone = normalizeText(row.customer_phone);
  const address = normalizeText(row.shipping_address);
  const city = normalizeText(row.shipping_city);
  const notes = normalizeText(row.notes);

  const hasAnyLegacyData = !!(fullName || email || phone || address || city || notes);

  if (!hasAnyLegacyData) {
    return null;
  }

  if (!fullName || !email || !phone || !address || !city) {
    throw new Error(
      `Order ${row.id} has partial legacy delivery data and cannot be migrated safely.`
    );
  }

  return {
    full_name: fullName,
    email,
    phone,
    address,
    city,
    ...(notes ? { notes } : {}),
  };
};

const hasDeliveryInfo = (deliveryInfo) =>
  !!(
    deliveryInfo &&
    typeof deliveryInfo === 'object' &&
    (deliveryInfo.full_name ||
      deliveryInfo.email ||
      deliveryInfo.phone ||
      deliveryInfo.address ||
      deliveryInfo.city ||
      deliveryInfo.notes)
  );

const normalizeText = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const getOrderTableColumns = async (strapi) => {
  const client = strapi.db.config.connection.client;

  if (client === 'sqlite') {
    const rows = await strapi.db.connection.raw("PRAGMA table_info('orders')");
    return rows.map((row) => row.name);
  }

  if (client === 'postgres') {
    const rows = await strapi.db.connection('information_schema.columns')
      .select('column_name')
      .where({ table_name: 'orders' });
    return rows.map((row) => row.column_name);
  }

  if (client === 'mysql') {
    const rows = await strapi.db.connection('information_schema.columns')
      .select('COLUMN_NAME')
      .where({
        TABLE_SCHEMA: strapi.db.config.connection.connection.database,
        TABLE_NAME: 'orders',
      });
    return rows.map((row) => row.COLUMN_NAME);
  }

  throw new Error(`Unsupported database client: ${client}`);
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
