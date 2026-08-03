const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('sidebar exposes search and the 60-chapter menu before appearance settings', () => {
  const search = html.indexOf('id="search"');
  const nav = html.indexOf('id="nav"');
  const customizer = html.indexOf('class="customizer"');
  assert.ok(search > 0 && nav > search && customizer > nav);
  assert.match(html, /type="search"[^>]+autocomplete="off"/);
  assert.match(html, /Pesquisar item, máquina, mod ou capítulo/);
  assert.match(html, /id="sidebarCount">60\/60/);
});

test('chapter view provides previous, next, selector, and whole-chapter completion', () => {
  assert.match(html, /function renderChapterToolbar\(c,bottom=false\)/);
  assert.match(html, /Escolher capítulo/);
  assert.match(html, /Marcar capítulo inteiro/);
  assert.match(html, /function toggleChapterComplete\(chapterId\)/);
  assert.match(html, /renderChapterToolbar\(c,true\)/);
});

test('search index covers chapters, restored guides, items, machines, mods, and systems', () => {
  assert.match(html, /function buildChapterSearchIndex\(\)/);
  assert.match(html, /relatedItems=ITEM_PAGES\.filter/);
  assert.match(html, /MULTIBLOCKS,\.\.\.BOSS_DATA,\.\.\.DIMENSION_DATA,\.\.\.RESOURCE_DATA/);
  assert.match(html, /primary=normalizeSearch\(\[relatedItems,relatedData\]\)/);
  assert.match(html, /all:normalizeSearch\(\[title,primary,summary,drafts\]\)/);
  assert.match(html, /\^\[\^\\s@\]\+@/);
});

test('progress and the last-open chapter persist locally', () => {
  assert.match(html, /atm10-v26-chapter-progress/);
  assert.match(html, /atm10-v27-current-chapter/);
  assert.match(html, /localStorage\.setItem\(CURRENT_CHAPTER_KEY/);
  assert.match(html, /localStorage\.setItem\(KEY,JSON\.stringify\(state\)\)/);
});

test('mobile menu and image galleries remain available', () => {
  assert.match(html, /@media\(max-width:820px\)/);
  assert.match(html, /id="menu">☰ Menu/);
  assert.match(html, /id="sidebarClose"/);
  assert.match(html, /data-tab="gallery">Galeria visual/);
  assert.match(html, /data-tab="onlineimages">Imagens online/);
});
