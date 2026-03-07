/**
 * order router
 */

import { factories } from '@strapi/strapi';

const defaultRouter = factories.createCoreRouter('api::order.order');
const coreRoutes =
  typeof defaultRouter.routes === 'function' ? defaultRouter.routes() : defaultRouter.routes;

export default {
  routes: [
    {
      method: 'POST',
      path: '/orders/checkout',
      handler: 'order.checkout',
      config: {
        auth: false,
      },
    },
    ...coreRoutes,
  ],
};
