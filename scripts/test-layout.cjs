const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const context = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('layout.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, context);
const { getLayout } = context.exports;
// Usable dimensions include short landscape windows, split screen and tablets.
for (const width of [240, 280, 296, 320, 360, 390, 600, 720, 844, 1024, 1600]) {
  for (const height of [240, 320, 390, 480, 640, 844, 1024]) {
    for (const fontScale of [1, 1.3, 1.5, 2]) {
      const l = getLayout(width, height, fontScale);
      assert.ok(l.cardWidth > 0);
      assert.ok(l.cardWidth * l.columns + l.gap * (l.columns - 1) <= l.contentWidth + 0.001);
      assert.ok(l.frameWidth <= width);
      assert.ok(l.drawerWidth < width);
      assert.ok(l.textAreaHeight <= height);
    }
  }
}
assert.equal(getLayout(280, 640).columns, 1);
assert.equal(getLayout(390, 844).columns, 2);
assert.equal(getLayout(844, 390).columns, 3);
assert.equal(getLayout(390, 844, 2).columns, 1);
assert.ok(getLayout(844, 390).short);
assert.ok(getLayout(390, 844, 2).stackActions);
console.log('308 responsive width/height/font-scale combinations passed.');
