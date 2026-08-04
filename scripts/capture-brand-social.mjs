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
      main { display: grid; width: 100%; justify-items: center; gap: 26px; padding: 72px; }
      .logo { width: 760px; }
      .logo svg { display: block; width: 100%; height: auto; }
      .promise { margin: 0; color: #e0a64b; font-size: 32px; font-weight: 650; letter-spacing: .13em; }
      .description { margin: 0; color: rgba(239,225,196,.62); font-size: 22px; letter-spacing: .08em; }
      .corner { position: absolute; width: 38px; height: 38px; border: 1px solid rgba(239,225,196,.09); transform: rotate(45deg); }
      .a { inset: 76px auto auto 184px; } .b { inset: 90px 132px auto auto; }
      .c { inset: auto auto 80px 134px; } .d { inset: auto 208px 56px auto; }
    </style></head><body>
      <i class="corner a"></i><i class="corner b"></i><i class="corner c"></i><i class="corner d"></i>
      <main><div class="logo">${logo}</div><p class="promise">one Session, then goodnight</p><p class="description">an open-source bedtime game</p></main>
    </body></html>`);
  await page.screenshot({ path: resolve("apps/site/public/brand/nindova-og.png") });
} finally {
  await browser.close();
}
