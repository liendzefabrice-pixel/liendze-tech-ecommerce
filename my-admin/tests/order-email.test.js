const test = require('node:test');
const assert = require('node:assert/strict');

const {
  handleOrderValidationEmail,
  shouldSendValidationEmail,
} = require('../dist/src/api/order/services/order-email.js');

function createStrapiHarness() {
  const sendCalls = [];
  const infoLogs = [];
  const errorLogs = [];

  return {
    sendCalls,
    infoLogs,
    errorLogs,
    strapi: {
      plugin(name) {
        assert.equal(name, 'email');

        return {
          service(serviceName) {
            assert.equal(serviceName, 'email');

            return {
              send: async (payload) => {
                sendCalls.push(payload);
              },
            };
          },
        };
      },
      log: {
        info(message) {
          infoLogs.push(message);
        },
        error(message) {
          errorLogs.push(message);
        },
      },
    },
  };
}

test('detects a transition into valide as sendable', () => {
  assert.equal(
    shouldSendValidationEmail('en_attente', {
      order_status: 'valide',
      customer_email: 'badinfo1987@gmail.com',
    }),
    true
  );
});

test('does not send when status stays valide', () => {
  assert.equal(
    shouldSendValidationEmail('valide', {
      order_status: 'valide',
      customer_email: 'badinfo1987@gmail.com',
    }),
    false
  );
});

test('sends an email when an order becomes valide and has a customer email', async () => {
  const harness = createStrapiHarness();

  const sent = await handleOrderValidationEmail(harness.strapi, 'en_attente', {
    order_id: 'CMD-1001',
    order_status: 'valide',
    customer_email: 'badinfo1987@gmail.com',
    customer_name: 'Marie Dupont',
    total_amount: 25000,
    shipping_address: 'Rue 123, Akwa',
    shipping_city: 'Douala',
    customer_phone: '+237699000111',
    items: [
      { name: 'Ordinateur portable', quantity: 1, price: 25000 },
    ],
  });

  assert.equal(sent, true);
  assert.equal(harness.sendCalls.length, 1);
  assert.equal(harness.sendCalls[0].to, 'badinfo1987@gmail.com');
  assert.equal(harness.sendCalls[0].subject, 'Confirmation de commande CMD-1001');
  assert.match(harness.sendCalls[0].text, /Bonjour Marie Dupont,/);
  assert.match(harness.sendCalls[0].text, /Numero de commande: CMD-1001/);
  assert.match(harness.sendCalls[0].text, /Montant total: 25/);
  assert.match(harness.sendCalls[0].text, /Ordinateur portable x1/);
  assert.match(harness.sendCalls[0].html, /Votre commande a ete validee/);
  assert.match(harness.sendCalls[0].html, /Marie Dupont/);
  assert.match(harness.sendCalls[0].html, /Rue 123, Akwa, Douala/);
  assert.match(harness.sendCalls[0].html, /Ordinateur portable/);
  assert.equal(harness.infoLogs.length, 1);
  assert.deepEqual(harness.errorLogs, []);
});

test('does not send when the updated order is not valide', async () => {
  const harness = createStrapiHarness();

  const sent = await handleOrderValidationEmail(harness.strapi, 'en_attente', {
    order_id: 'CMD-1002',
    order_status: 'en_attente',
    customer_email: 'badinfo1987@gmail.com',
  });

  assert.equal(sent, false);
  assert.deepEqual(harness.sendCalls, []);
  assert.deepEqual(harness.infoLogs, []);
  assert.deepEqual(harness.errorLogs, []);
});

test('does not send when the customer email is missing', async () => {
  const harness = createStrapiHarness();

  const sent = await handleOrderValidationEmail(harness.strapi, 'en_attente', {
    order_id: 'CMD-1003',
    order_status: 'valide',
    customer_email: null,
  });

  assert.equal(sent, false);
  assert.deepEqual(harness.sendCalls, []);
  assert.deepEqual(harness.infoLogs, []);
  assert.deepEqual(harness.errorLogs, []);
});
