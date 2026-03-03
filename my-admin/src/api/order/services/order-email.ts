import type { Core } from '@strapi/strapi';

type OrderLike = {
  customer_email?: string | null;
  order_id?: string | null;
  order_status?: string | null;
};

export const shouldSendValidationEmail = (
  previousStatus: string | null | undefined,
  order: OrderLike | null | undefined
) => {
  return order?.order_status === 'valide' && previousStatus !== 'valide' && !!order?.customer_email;
};

export const sendOrderValidationEmail = async (strapi: Core.Strapi, order: OrderLike) => {
  await strapi.plugin('email').service('email').send({
    to: order.customer_email as string,
    subject: `Commande Validée ! - ${order.order_id}`,
    html: `<h3>Bonjour, votre commande est validée !</h3>`,
  });
};

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
