import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Server => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  // On ajoute l'autorisation du transfert de données ici
  transfer: {
    remote: {
      enabled: env.bool('STRAPI_TRANSFER_REMOTE_ENABLED', true),
    },
  },
});

export default config;