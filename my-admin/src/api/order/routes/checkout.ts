export default {
  routes: [
    {
      method: 'GET',
      path: '/orders/me',
      handler: 'order.me',
      config: {
        auth: {},
      },
    },
    {
      method: 'POST',
      path: '/orders/checkout',
      handler: 'order.checkout',
      config: {
        auth: false,
      },
    },
  ],
};
