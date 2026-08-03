import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import QRCode from "qrcode";
import publicFacts from "../public-facts.json" with { type: "json" };

const { canonicalPlayUrl } = publicFacts;
const output = resolve(import.meta.dirname, "../apps/site/public/play-qr.svg");
const svg = await QRCode.toString(canonicalPlayUrl, {
  type: "svg",
  errorCorrectionLevel: "M",
  margin: 2,
  color: { dark: "#171b38ff", light: "#e7d6b8ff" },
});

await mkdir(resolve(output, ".."), { recursive: true });
await writeFile(output, svg.endsWith("\n") ? svg : `${svg}\n`, "utf8");
console.log(`Generated proposed direct play QR for ${canonicalPlayUrl}`);
