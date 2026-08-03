import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import QRCode from "qrcode";

const canonicalPlayUrl = "https://udhawan97.github.io/Nindova/play/";

test("the published QR is deterministic, direct, and contains no runtime content", async () => {
  const url = new URL(canonicalPlayUrl);
  assert.deepEqual(
    { protocol: url.protocol, host: url.host, path: url.pathname, query: url.search, hash: url.hash },
    { protocol: "https:", host: "udhawan97.github.io", path: "/Nindova/play/", query: "", hash: "" },
  );
  const expected = await QRCode.toString(canonicalPlayUrl, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 2,
    color: { dark: "#171b38ff", light: "#e7d6b8ff" },
  });
  const generated = await readFile(new URL("../../apps/site/public/play-qr.svg", import.meta.url), "utf8");
  assert.equal(generated, expected.endsWith("\n") ? expected : `${expected}\n`);
  assert.doesNotMatch(generated, /<script|javascript:|\shref=/i);
});
