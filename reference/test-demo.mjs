import { chromium } from 'playwright';

const errors = [];
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(async e => {
  return chromium.launch();
});
const page = await (await browser.newContext({ viewport:{width:1280,height:800} })).newPage();
page.on('console', m => { if (m.type()==='error') errors.push(m.text()); });
page.on('pageerror', e => errors.push('PAGEERROR: '+e.message));

const state = () => page.evaluate(() => window.__ct.state);

await page.goto('file:///home/claude/closing-time/nindova-demo.html');
await page.waitForTimeout(1200);
await page.screenshot({ path: 'shots/01-intake.png' });

// enter → dark room
await page.click('#beginBtn');
await page.waitForTimeout(1800);
await page.screenshot({ path: 'shots/02-arrive-dark.png' });

// light the lamp with a real click at its screen position
const lamp = await page.evaluate(() => window.__ct.toScreen(580, 442));
await page.mouse.click(lamp.x, lamp.y);
await page.waitForTimeout(2600);
await page.screenshot({ path: 'shots/03-play-lit.png' });

// tap an object → naming box should open; type a name
const obj0 = await page.evaluate(() => {
  const o = window.__ct.objects.find(o => o.state==='desk');
  return o ? { i:o.id, ...window.__ct.toScreen(o.x,o.y) } : null;
});
if (obj0) {
  await page.mouse.click(obj0.x, obj0.y);
  await page.waitForTimeout(400);
  const boxVisible = await page.evaluate(() => document.getElementById('nameBox').style.display==='block');
  console.log('NAMEBOX OPENS ON TAP:', boxVisible);
  if (boxVisible) { await page.keyboard.type('call the bank'); await page.keyboard.press('Enter'); }
  else await page.evaluate(() => window.__ct.nameObject(0,'call the bank'));
}
await page.waitForTimeout(600);
await page.screenshot({ path: 'shots/04-named.png' });

// drag one object for real, then store the rest
const drag = await page.evaluate(() => {
  const o = window.__ct.objects.find(o => o.state==='desk');
  const s = window.__ct.slots.find(s => !s.occupied);
  if (!o || !s) return null;
  const from = window.__ct.toScreen(o.x, o.y);
  const sy = s.drawer!==null ? s.y : s.y-22;
  const to = window.__ct.toScreen(s.x, sy);
  return { from, to };
});
if (drag) {
  await page.mouse.move(drag.from.x, drag.from.y);
  await page.mouse.down();
  for (let i=1;i<=14;i++){
    await page.mouse.move(
      drag.from.x + (drag.to.x-drag.from.x)*i/14,
      drag.from.y + (drag.to.y-drag.from.y)*i/14);
    await page.waitForTimeout(26);
  }
  await page.mouse.up();
  await page.waitForTimeout(900);
}
while (await page.evaluate(() => window.__ct.storeNext())) await page.waitForTimeout(720);
await page.waitForTimeout(1400);

// wipe
if (await state() === 'wipe') {
  const band = await page.evaluate(() => window.__ct.toScreen(520, 522));
  for (let pass=0; pass<3 && (await state())==='wipe'; pass++){
    await page.mouse.move(band.x-260, band.y);
    await page.mouse.down();
    for (let i=0;i<=16;i++){ await page.mouse.move(band.x-260+i*36, band.y+Math.sin(i)*4); await page.waitForTimeout(16); }
    await page.mouse.up();
  }
  if (await state()==='wipe') await page.evaluate(() => window.__ct.finishWipe());
}
console.log('AFTER WIPE:', await state());
await page.waitForTimeout(1500);
await page.screenshot({ path: 'shots/05-approach.png' });

// wait through approach into the vista
await page.waitForFunction(() => window.__ct.state==='vista', null, { timeout: 10000 });
await page.waitForTimeout(4000);
await page.screenshot({ path: 'shots/06-vista-meadow.png' });

// let a couple of animals over
for (let i=0;i<3;i++){
  await page.evaluate(() => window.__ct.vistaTapNext());
  await page.waitForTimeout(1600);
}
await page.screenshot({ path: 'shots/07-vista-hops.png' });

// fast-forward to the final animal and its settling
await page.evaluate(() => window.__ct.setVistaT(0.88));
await page.waitForFunction(() => window.__ct.state==='drift', null, { timeout: 45000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: 'shots/08-drift.png' });

// wander the light briefly, then end the drift
const mid = await page.evaluate(() => window.__ct.toScreen(500, 380));
await page.mouse.move(mid.x, mid.y); await page.mouse.down();
await page.mouse.move(mid.x+120, mid.y-40, {steps:10}); await page.mouse.up();
await page.waitForTimeout(1200);
await page.evaluate(() => window.__ct.finishDrift());
await page.waitForFunction(() => window.__ct.state==='sign', null, { timeout: 12000 });
await page.waitForTimeout(1200);
await page.screenshot({ path: 'shots/09-sign.png' });

await page.evaluate(() => window.__ct.tapSign());
await page.waitForTimeout(2600);
await page.screenshot({ path: 'shots/10-dark.png' });

await page.waitForSelector('#endCard:not(.hidden)', { timeout: 15000 }).catch(()=>{});
await page.waitForTimeout(800);
await page.screenshot({ path: 'shots/11-endcard.png' });

console.log('FINAL STATE:', await state());
console.log('CONSOLE ERRORS:', errors.length ? errors : 'none');
await browser.close();
