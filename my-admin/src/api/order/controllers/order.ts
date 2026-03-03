import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::order.order', ({ strapi }) => ({
  async update(ctx) {
    // 1. Exécuter la mise à jour
    const response = await super.update(ctx);
    
    // 2. Récupérer proprement les données
    const updatedData = response.data.attributes || response.data; 
    const status = updatedData.order_status;
    const email = updatedData.customer_email;

    console.log("--- DEBUG EMAIL ---");
    console.log("Statut détecté :", status);
    console.log("Email détecté :", email);

    // 3. Déclenchement de l'envoi
    if (status === 'valide' && email) {
      try {
        await strapi.plugin('email').service('email').send({
          to: email,
          from: 'liendzefabricecreative@gmail.com',
          subject: `Commande Validée ! - ${updatedData.order_id}`,
          html: `<h3>Bonjour, votre commande est validée !</h3>`,
        });
        console.log("✅ SUCCÈS : Email envoyé !");
      } catch (err) {
        console.error("❌ ERREUR SMTP :", err.message);
      }
    } else {
      console.log("⚠️ EMAIL NON ENVOYÉ : Soit le statut n'est pas 'valide', soit l'email est vide.");
    }

    return response;
  },
}));