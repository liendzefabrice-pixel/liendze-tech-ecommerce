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
      customer_email: 'client@example.com',
    }),
    true
  );
});

test('does not send when status stays valide', () => {
  assert.equal(
    shouldSendValidationEmail('valide', {
      order_status: 'valide',
      customer_email: 'client@example.com',
    }),
    false
  );
});

test('sends an email when an order becomes valide and has a customer email', async () => {
  const harness = createStrapiHarness();

  const sent = await handleOrderValidationEmail(harness.strapi, 'en_attente', {
    order_id: 'CMD-1001',
    order_status: 'valide',
    customer_email: 'client@example.com',
  });

  assert.equal(sent, true);
  assert.deepEqual(harness.sendCalls, [
    {
      to: 'client@example.com',
      subject: 'Commande Validée ! - CMD-1001',
      html: '<h3>Bonjour, votre commande est validée !</h3>',
    },
  ]);
  assert.equal(harness.infoLogs.length, 1);
  assert.deepEqual(harness.errorLogs, []);
});

test('does not send when the updated order is not valide', async () => {
  const harness = createStrapiHarness();

  const sent = await handleOrderValidationEmail(harness.strapi, 'en_attente', {
    order_id: 'CMD-1002',
    order_status: 'en_attente',
    customer_email: 'client@example.com',
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
