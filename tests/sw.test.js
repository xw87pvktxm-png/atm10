const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function loadServiceWorker(cacheNames = []) {
  const handlers = {};
  const deletedCaches = [];
  const context = {
    URL,
    caches: {
      delete: async key => {
        deletedCaches.push(key);
        return true;
      },
      keys: async () => cacheNames,
      match: async () => undefined,
      open: async () => ({ addAll: async () => {}, put: async () => {} }),
    },
    fetch: async () => {
      throw new Error('Unexpected network request');
    },
    self: {
      addEventListener: (name, handler) => {
        handlers[name] = handler;
      },
      clients: { claim: async () => {} },
      location: { origin: 'https://example.test' },
      skipWaiting: async () => {},
    },
  };
  const source = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
  vm.runInNewContext(source, context);
  return { deletedCaches, handlers };
}

test('does not intercept or cache cross-origin requests', () => {
  const { handlers } = loadServiceWorker();
  let intercepted = false;

  handlers.fetch({
    request: { method: 'GET', url: 'https://api.example.test/account' },
    respondWith: () => {
      intercepted = true;
    },
  });

  assert.equal(intercepted, false);
});

test('activation deletes only obsolete ATM10 caches', async () => {
  const { deletedCaches, handlers } = loadServiceWorker([
    'atm10-guide-final-v25',
    'atm10-guide-v26',
    'another-app-v4',
  ]);
  let activation;

  handlers.activate({ waitUntil: promise => { activation = promise; } });
  await activation;

  assert.deepEqual(deletedCaches, ['atm10-guide-final-v25', 'atm10-guide-v26']);
});
