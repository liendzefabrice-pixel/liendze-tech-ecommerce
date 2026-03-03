export default ({ env }: { env: any }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'smtp.gmail.com'),
        port: env.int('SMTP_PORT', 587),
        auth: {
          user: env('SMTP_USER'),
          pass: env('SMTP_PASSWORD'),
        },
        secure: env.bool('SMTP_SECURE', false),
      },
      settings: {
        defaultFrom: env('MAIL_FROM', env('SMTP_USER')),
        defaultReplyTo: env('MAIL_REPLY_TO', env('MAIL_FROM', env('SMTP_USER'))),
      },
    },
  },
});
