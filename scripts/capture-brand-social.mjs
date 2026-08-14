import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";

const logo = await readFile(resolve("apps/site/public/brand/nindova-logo-horizontal.svg"), "utf8");
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html>
    <html><head><style>
      * { box-sizing: border-box; }
      html, body { width: 1200px; height: 630px; margin: 0; overflow: hidden; }
      body {
        display: grid;
        place-items: center;
        color: #efe1c4;
        background:
          radial-gradient(circle at 17% 24%, rgba(58,74,158,.2), transparent 280px),
          radial-gradient(circle at 85% 78%, rgba(154,58,66,.16), transparent 260px),
          #150d20;
        font-family: ui-sans-serif, system-ui, sans-serif;
      }
      main { display: grid; width: 100%; height: 100%; grid-template-columns: minmax(0, 1.2fr) minmax(290px, .8fr); align-items: center; gap: 62px; padding: 70px 82px; }
      .copy { min-width: 0; }
      .logo { width: 420px; margin-bottom: 54px; }
      .logo svg { display: block; width: 100%; height: auto; }
      .promise { max-width: 650px; margin: 0; color: #efe1c4; font-family: Georgia, serif; font-size: 61px; font-weight: 500; letter-spacing: -.05em; line-height: .92; }
      .description { margin: 28px 0 0; color: #e0a64b; font-size: 16px; font-weight: 720; letter-spacing: .1em; text-transform: uppercase; white-space: nowrap; }
      .plan { display: grid; grid-template-areas: "night salon" "gallery salon"; grid-template-columns: .72fr 1.28fr; height: 390px; border: 1px solid rgba(224,166,75,.72); box-shadow: 18px 18px 0 rgba(58,74,158,.18); }
      .room { display: grid; align-content: end; padding: 25px; border-color: rgba(224,166,75,.4); background: rgba(33,26,51,.82); color: #efe1c4; font-family: Georgia, serif; font-size: 25px; }
      .room small { display: block; margin-bottom: 7px; color: rgba(239,225,196,.55); font-family: ui-sans-serif, system-ui, sans-serif; font-size: 11px; letter-spacing: .14em; text-transform: uppercase; }
      .night { grid-area: night; border-right: 1px solid rgba(224,166,75,.4); border-bottom: 1px solid rgba(224,166,75,.4); }
      .gallery { grid-area: gallery; border-right: 1px solid rgba(224,166,75,.4); }
      .salon { grid-area: salon; }
      .doors { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 22px; }
      .doors i { display: block; height: 52px; border: 1px solid rgba(224,166,75,.28); }
      .doors i:first-child { grid-column: 1 / -1; }
      .corner { position: absolute; width: 38px; height: 38px; border: 1px solid rgba(239,225,196,.09); transform: rotate(45deg); }
      .a { inset: 76px auto auto 184px; } .b { inset: 90px 132px auto auto; }
      .c { inset: auto auto 80px 134px; } .d { inset: auto 208px 56px auto; }
    </style></head><body>
      <i class="corner a"></i><i class="corner b"></i><i class="corner c"></i><i class="corner d"></i>
      <main>
        <div class="copy"><div class="logo">${logo}</div><p class="promise">Every room knows<br>when to close.</p><p class="description">Eight authored endings · one bounded Night Room</p></div>
        <div class="plan" aria-hidden="true"><div class="room night"><small>North wing</small>Night Room</div><div class="room gallery"><small>West wing</small>Gallery</div><div class="room salon"><small>The centre</small>Grand Salon<div class="doors"><i></i><i></i><i></i><i></i><i></i></div></div></div>
      </main>
    </body></html>`);
  await page.screenshot({ path: resolve("apps/site/public/brand/nindova-og.png") });
} finally {
  await browser.close();
}
