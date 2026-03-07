import { factories } from '@strapi/strapi';

const ORDER_UID = 'api::order.order' as any;

export default factories.createCoreController(ORDER_UID, ({ strapi }) => ({
  async me(ctx: any) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Authentication required');
    }

    const orders = await strapi.documents(ORDER_UID).findMany({
      filters: {
        client: {
          id: {
            $eq: user.id,
          },
        },
      },
      populate: '*',
      sort: ['createdAt:desc'],
    });

    ctx.send({ data: orders });
  },

  async checkout(ctx: any) {
    const data = ctx.request.body?.data;

    if (!data) {
      return ctx.badRequest('Missing order payload');
    }

    let authenticatedUserId: number | null = null;

    try {
      const jwtService = strapi.plugin('users-permissions').service('jwt');
      const token = await jwtService.getToken(ctx);

      if (token?.id) {
        authenticatedUserId = token.id;
      }
    } catch {
      authenticatedUserId = null;
    }

    const orderData = {
      ...data,
      ...(authenticatedUserId ? { client: authenticatedUserId } : {}),
    };

    const createdOrder = await strapi.documents(ORDER_UID).create({
      data: orderData,
    });

    ctx.send({ data: createdOrder });
  },
}));
