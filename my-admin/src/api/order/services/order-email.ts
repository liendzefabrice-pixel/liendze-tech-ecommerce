import type { Core } from '@strapi/strapi';

type OrderLike = {
  customer_email?: string | null;
  customer_name?: string | null;
  order_id?: string | null;
  order_status?: string | null;
  total_amount?: number | string | null;
  shipping_address?: string | null;
  shipping_city?: string | null;
  customer_phone?: string | null;
  notes?: string | null;
  items?: unknown;
};

export const shouldSendValidationEmail = (
  previousStatus: string | null | undefined,
  order: OrderLike | null | undefined
) => {
  return order?.order_status === 'valide' && previousStatus !== 'valide' && !!order?.customer_email;
};

export const sendOrderValidationEmail = async (strapi: Core.Strapi, order: OrderLike) => {
  const customerName = order.customer_name?.trim() || 'Cher client';
  const orderId = order.order_id?.trim() || 'N/A';
  const totalAmount = formatCurrency(order.total_amount);
  const addressLines = [order.shipping_address, order.shipping_city].filter(Boolean).join(', ');
  const items = normalizeItems(order.items);
  const itemsHtml = items.length
    ? `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-top: 16px;">
        <thead>
          <tr>
            <th align="left" style="padding: 10px 0; border-bottom: 1px solid #d9e2ec; font-size: 13px; color: #486581;">Article</th>
            <th align="center" style="padding: 10px 0; border-bottom: 1px solid #d9e2ec; font-size: 13px; color: #486581;">Quantite</th>
            <th align="right" style="padding: 10px 0; border-bottom: 1px solid #d9e2ec; font-size: 13px; color: #486581;">Prix</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map(
              (item) => `
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eef2f6; color: #102a43;">${escapeHtml(item.name)}</td>
                  <td align="center" style="padding: 12px 0; border-bottom: 1px solid #eef2f6; color: #102a43;">${item.quantity}</td>
                  <td align="right" style="padding: 12px 0; border-bottom: 1px solid #eef2f6; color: #102a43;">${escapeHtml(formatCurrency(item.price))}</td>
                </tr>`
            )
            .join('')}
        </tbody>
      </table>
    `
    : '';
  const summaryRows = [
    { label: 'Numero de commande', value: orderId },
    { label: 'Statut', value: 'Validee' },
    { label: 'Montant total', value: totalAmount },
    { label: 'Adresse de livraison', value: addressLines || 'Non renseignee' },
    { label: 'Telephone', value: order.customer_phone?.trim() || 'Non renseigne' },
  ];

  const notesHtml = order.notes?.trim()
    ? `<p style="margin: 16px 0 0; color: #486581; font-size: 14px; line-height: 1.6;"><strong>Note:</strong> ${escapeHtml(order.notes.trim())}</p>`
    : '';

  await strapi.plugin('email').service('email').send({
    to: order.customer_email as string,
    subject: `Confirmation de commande ${orderId}`,
    text: buildTextEmail(customerName, summaryRows, items),
    html: `
      <div style="margin: 0; padding: 24px 0; background: #f4f7fb; font-family: Arial, Helvetica, sans-serif;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 18px; overflow: hidden;">
          <tr>
            <td style="padding: 32px 40px; background: #102a43; color: #ffffff;">
              <p style="margin: 0; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.82;">Liendze Tech Solutions</p>
              <h1 style="margin: 12px 0 0; font-size: 28px; line-height: 1.2;">Votre commande a ete validee</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 40px;">
              <p style="margin: 0; color: #102a43; font-size: 16px; line-height: 1.7;">Bonjour ${escapeHtml(customerName)},</p>
              <p style="margin: 16px 0 0; color: #486581; font-size: 15px; line-height: 1.7;">
                Nous vous confirmons que votre commande <strong>${escapeHtml(orderId)}</strong> a ete validee par notre equipe.
                Nous preparons maintenant son traitement et reviendrons vers vous si une information complementaire est necessaire.
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 24px; border-collapse: collapse; background: #f8fbff; border: 1px solid #d9e2ec; border-radius: 14px;">
                ${summaryRows
                  .map(
                    (row) => `
                      <tr>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #d9e2ec; color: #486581; font-size: 14px; width: 42%;">${escapeHtml(row.label)}</td>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #d9e2ec; color: #102a43; font-size: 14px; font-weight: 600;">${escapeHtml(row.value)}</td>
                      </tr>
                    `
                  )
                  .join('')}
              </table>

              ${itemsHtml}
              ${notesHtml}

              <p style="margin: 24px 0 0; color: #486581; font-size: 15px; line-height: 1.7;">
                Pour toute question concernant votre commande, vous pouvez repondre directement a cet email ou contacter notre service client.
              </p>
              <p style="margin: 24px 0 0; color: #102a43; font-size: 15px; line-height: 1.7;">
                Cordialement,<br />
                <strong>L'equipe Liendze Tech Solutions</strong>
              </p>
            </td>
          </tr>
        </table>
      </div>
    `,
  });
};

const buildTextEmail = (
  customerName: string,
  summaryRows: Array<{ label: string; value: string }>,
  items: Array<{ name: string; quantity: number; price: number | string | null }>
) => {
  const summary = summaryRows.map((row) => `${row.label}: ${row.value}`).join('\n');
  const itemLines = items.length
    ? `\n\nArticles:\n${items
        .map((item) => `- ${item.name} x${item.quantity} (${formatCurrency(item.price)})`)
        .join('\n')}`
    : '';

  return [
    `Bonjour ${customerName},`,
    '',
    'Votre commande a ete validee par notre equipe.',
    '',
    summary,
    itemLines,
    '',
    'Merci pour votre confiance.',
    "L'equipe Liendze Tech Solutions",
  ]
    .filter(Boolean)
    .join('\n');
};

const formatCurrency = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === '') {
    return 'Montant indisponible';
  }

  const amount = typeof value === 'number' ? value : Number(value);

  if (Number.isNaN(amount)) {
    return String(value);
  }

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0,
  }).format(amount);
};

const normalizeItems = (items: unknown) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const record = item as Record<string, unknown>;
      const name = typeof record.name === 'string'
        ? record.name
        : typeof record.title === 'string'
          ? record.title
          : typeof record.product_name === 'string'
            ? record.product_name
            : 'Article';
      const quantityValue = typeof record.quantity === 'number' ? record.quantity : Number(record.quantity ?? 1);
      const quantity = Number.isFinite(quantityValue) && quantityValue > 0 ? quantityValue : 1;
      const price =
        typeof record.price === 'number' || typeof record.price === 'string'
          ? record.price
          : typeof record.unit_price === 'number' || typeof record.unit_price === 'string'
            ? record.unit_price
            : null;

      return { name, quantity, price };
    })
    .filter((item): item is { name: string; quantity: number; price: number | string | null } => item !== null);
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const handleOrderValidationEmail = async (
  strapi: Core.Strapi,
  previousStatus: string | null | undefined,
  order: OrderLike | null | undefined
) => {
  if (!shouldSendValidationEmail(previousStatus, order)) {
    return false;
  }

  try {
    await sendOrderValidationEmail(strapi, order as OrderLike);
    strapi.log.info(`Order validation email sent for order ${order?.order_id}`);
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown email error';
    strapi.log.error(`SMTP send failed for order ${order?.order_id}: ${message}`);
    return false;
  }
};
