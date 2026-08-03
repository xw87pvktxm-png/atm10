const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

function jsonConstant(name, endMarker) {
  const marker = `const ${name}=`;
  const start = html.indexOf(marker);
  assert.notEqual(start, -1, `${name} must exist`);
  const end = html.indexOf(endMarker, start + marker.length);
  assert.notEqual(end, -1, `${name} must have a closing marker`);
  return JSON.parse(html.slice(start + marker.length, end));
}

const dimensions = jsonConstant('DIMENSION_DATA', ';\nconst HIDDEN_LOCATION_DATA=');
const hiddenLocations = jsonConstant('HIDDEN_LOCATION_DATA', ';\nfunction dimensionText');

test('dimension progression contains all ten destinations in difficulty order', () => {
  assert.deepEqual(
    dimensions.map(dimension => dimension.en),
    ['Overworld', 'Nether', 'The End', 'Mining Dimension', 'The Bumblezone', 'Twilight Forest', 'The Other', 'Eternal Starlight', 'The Undergarden', 'The Beyond']
  );
  assert.deepEqual(dimensions.map(dimension => dimension.difficulty), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});

test('every dimension has bilingual access and purpose information', () => {
  for (const dimension of dimensions) {
    for (const field of ['portalPt', 'portalEn', 'whyPt', 'whyEn', 'structuresPt', 'structuresEn']) {
      assert.ok(dimension[field].length >= 5, `${dimension.en} is missing ${field}`);
    }
  }
  assert.equal(dimensions.find(dimension => dimension.id === 'other').portalEn, 'Teleport Pad in the Nether');
  assert.match(dimensions.find(dimension => dimension.id === 'beyond').whyEn, /late-game progression/);
});

test('hidden location guide includes all supplied exploration targets', () => {
  assert.equal(hiddenLocations.length, 10);
  const names = hiddenLocations.map(location => location.en).join('\n');
  for (const expected of ['Ancient Cities', 'Cataclysm', "YUNG's", 'Dragon nests', 'Roguelike Dungeons', 'Wilden arenas', 'Piglich Pyramid', 'Twilight Forest boss arenas', 'Eternal Starlight temples', 'Royal Bee Chambers']) {
    assert.match(names, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('dimension overview is shown in chapter guides and the dashboard', () => {
  assert.match(html, /renderDimensionOverview\(false,c\.id\)/);
  assert.match(html, /renderDimensionOverview\(true\)/);
  assert.match(html, /chapterId!==39&&chapterId!==54/);
});
