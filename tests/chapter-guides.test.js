const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function loadGuides() {
  const context = { window: {} };
  const source = fs.readFileSync(path.join(__dirname, '..', 'chapter-guides.js'), 'utf8');
  vm.runInNewContext(source, context);
  return context.window.ATM10_CHAPTER_GUIDES;
}

test('maps recovered content to all 60 current chapters', () => {
  const guides = loadGuides();
  const chapterIds = Array.from({ length: 60 }, (_, index) => String(index + 1));

  assert.deepEqual(Object.keys(guides.map), chapterIds);
  for (const id of chapterIds) {
    assert.ok(guides.map[id].length > 0, `chapter ${id} has no recovered guide`);
  }
});

test('every mapped draft exists and contains substantial content', () => {
  const guides = loadGuides();

  for (const [chapterId, draftIds] of Object.entries(guides.map)) {
    for (const draftId of draftIds) {
      const draft = guides.drafts[draftId];
      assert.ok(draft, `chapter ${chapterId} references missing draft ${draftId}`);
      assert.ok(draft.title.length > 3);
      assert.ok(draft.body.length > 250, `draft ${draftId} is unexpectedly short`);
    }
  }
});

test('recovered text cannot inject script elements', () => {
  const guides = loadGuides();
  const combined = Object.values(guides.drafts).map(draft => draft.body).join('\n');

  assert.equal(/<script\b/i.test(combined), false);
});
