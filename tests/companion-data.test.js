const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function loadData() {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'companion-data.js'), 'utf8'), context);
  return context.window.ATM10_COMPANION_DATA;
}

test('companion dataset fills every requested completion category', () => {
  const data = loadData();
  for (const category of ['machines','automations','resources','endgame','structures']) {
    assert.ok(data.completion[category].length >= 10, `${category} should have a useful starter checklist`);
  }
});

test('boss additions complete the 23-entry tracker without duplicate IDs', () => {
  const data = loadData();
  assert.equal(data.bosses.length, 15);
  assert.equal(new Set(data.bosses.map(x => x.id)).size, data.bosses.length);
  for (const boss of data.bosses) {
    assert.ok(boss.location && boss.prep && boss.mechanics && boss.drops && boss.repeat);
    assert.ok(boss.chapter >= 1 && boss.chapter <= 60);
  }
});

test('missing dimension maps and planning views are present', () => {
  const data = loadData();
  assert.deepEqual(Object.keys(data.worlds).sort(), ['beyond','mining','other','starlight','under']);
  assert.ok(data.flowcharts.length >= 3);
  assert.ok(data.techTree.length >= 5);
  assert.ok(data.comparisons.length >= 4);
});

