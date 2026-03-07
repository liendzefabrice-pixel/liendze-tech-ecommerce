export default {
  routes: [
    {
      method: 'GET',
      path: '/delivery-profiles/me',
      handler: 'delivery-profile.me',
      config: {
        auth: {},
      },
    },
    {
      method: 'PUT',
      path: '/delivery-profiles/me',
      handler: 'delivery-profile.upsertMe',
      config: {
        auth: {},
      },
    },
  ],
};
