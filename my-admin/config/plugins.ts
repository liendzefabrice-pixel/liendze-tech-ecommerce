export default ({ env }: { env: any }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: 'liendzefabricecreative@gmail.com',
          pass: env('SMTP_PASSWORD'), 
        },
        secure: false,
        tls: {
          rejectUnauthorized: false,
        },
      },
      settings: {
        defaultFrom: 'liendzefabricecreative@gmail.com',
        defaultReplyTo: 'liendzefabricecreative@gmail.com',
      },
    },
  },
});