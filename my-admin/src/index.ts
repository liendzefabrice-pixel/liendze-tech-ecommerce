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
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await ensureStorefrontPermissions(strapi);

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

const ensureStorefrontPermissions = async (strapi: Core.Strapi) => {
  const roleService = strapi.plugin('users-permissions').service('role') as any;
  const roles = await roleService.find();

  const publicRole = roles.find((role: { type?: string }) => role.type === 'public');
  const authenticatedRole = roles.find((role: { type?: string }) => role.type === 'authenticated');

  if (publicRole) {
    const publicRoleDetails = await roleService.findOne(publicRole.id);
    enablePermission(publicRoleDetails.permissions, 'api::product', 'product', 'find');
    enablePermission(publicRoleDetails.permissions, 'api::product', 'product', 'findOne');
    enablePermission(publicRoleDetails.permissions, 'api::category', 'category', 'find');
    enablePermission(publicRoleDetails.permissions, 'api::category', 'category', 'findOne');

    await roleService.updateRole(publicRole.id, {
      name: publicRoleDetails.name,
      description: publicRoleDetails.description,
      permissions: publicRoleDetails.permissions,
    });
  }

  if (authenticatedRole) {
    const authenticatedRoleDetails = await roleService.findOne(authenticatedRole.id);
    enablePermission(authenticatedRoleDetails.permissions, 'api::order', 'order', 'find');
    enablePermission(authenticatedRoleDetails.permissions, 'api::order', 'order', 'me');
    enablePermission(authenticatedRoleDetails.permissions, 'api::delivery-profile', 'delivery-profile', 'me');
    enablePermission(authenticatedRoleDetails.permissions, 'api::delivery-profile', 'delivery-profile', 'upsertMe');

    await roleService.updateRole(authenticatedRole.id, {
      name: authenticatedRoleDetails.name,
      description: authenticatedRoleDetails.description,
      permissions: authenticatedRoleDetails.permissions,
    });
  }
};

const enablePermission = (
  permissions: Record<string, any>,
  typeName: string,
  controllerName: string,
  actionName: string
) => {
  const action = permissions?.[typeName]?.controllers?.[controllerName]?.[actionName];

  if (action) {
    action.enabled = true;
  }
};
