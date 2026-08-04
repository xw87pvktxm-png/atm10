const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('inline application script has valid JavaScript syntax', () => {
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.ok(scripts.length);
  for (const script of scripts) assert.doesNotThrow(() => new Function(script[1]));
});

test('remaining companion views are reachable from the main navigation', () => {
  for (const tab of ['flows','techtree','compare','backup']) {
    assert.match(html, new RegExp(`data-tab="${tab}"`));
    assert.match(html, new RegExp(`tab==='${tab}'`));
  }
});

test('full backup includes scalable datasets', () => {
  for (const field of ['schema_version:2','current_chapter:current','completion:{','encyclopedia:']) {
    assert.ok(html.includes(field), `missing backup field ${field}`);
  }
  assert.match(html, /function exportFullBackup/);
  assert.match(html, /function importFullBackup/);
});

test('all requested configurable calculators exist', () => {
  for (const fn of ['calcEnergy','calcMatrix','calcReactor','calcStock']) {
    assert.match(html, new RegExp(`function ${fn}\\(`));
    assert.match(html, new RegExp(`onclick="${fn}\\(\\)"`));
  }
});

test('the companion does not add an AI assistant', () => {
  assert.doesNotMatch(html, /data-tab="ai"|AI assistant|assistente de IA/i);
});
