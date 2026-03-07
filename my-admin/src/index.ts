import type { Core } from '@strapi/strapi';
import { handleOrderValidationEmail } from './api/order/services/order-email';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    strapi.db.lifecycles.subscribe({
      models: ['api::order.order'],
      async beforeUpdate(event) {
        const where = event.params?.where || {};
        const orderId = where.id;
        const documentId = where.documentId;

        if (!orderId && !documentId) {
          return;
        }

        const existingOrder = await strapi.db.query('api::order.order').findOne({
          where: orderId ? { id: orderId } : { documentId },
          select: ['order_status'],
        });

        event.state = event.state || {};
        event.state.previousStatus = existingOrder?.order_status;
      },
      async afterUpdate(event) {
        await handleOrderValidationEmail(
          strapi,
          (event.state as { previousStatus?: string | null } | undefined)?.previousStatus,
          event.result as {
            order_status?: string;
            order_id?: string;
            total_amount?: number | string;
            items?: unknown;
            delivery_info?: {
              full_name?: string;
              email?: string;
              phone?: string;
              address?: string;
              city?: string;
              notes?: string;
            };
          }
        );
      },
    });
  },
};
