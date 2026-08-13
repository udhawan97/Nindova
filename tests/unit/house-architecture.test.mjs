import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "../..");

test("the House shell composes Sector Sprint without owning its engine lifecycle", async () => {
  const shell = await readFile(resolve(root, "apps/house/src/house.ts"), "utf8");
  const table = await readFile(resolve(root, "apps/house/src/sector-sprint-table.ts"), "utf8");
  assert.doesNotMatch(shell, /from "\.\/sector-sprint"/);
  assert.doesNotMatch(shell, /\blet runner(?:Frame|LastTimestamp|SessionElapsed|Input|ActivePointer|Accumulator|RenderQuality|FrameIntervals|Boundary|Interrupted|State)\b/);
  assert.doesNotMatch(shell, /\b(?:stepRunner|drawRunnerFrame|createRunnerState|requestAnimationFrame\(runRunnerFrame)/);
  assert.match(shell, /createSectorSprintTable/);
  assert.match(table, /type SectorSprintTerminal[\s\S]*"completed"[\s\S]*"boundary-closed"[\s\S]*"abandoned"/);
  assert.match(table, /if \(elapsedMs >= RUNNER_SESSION_SECONDS \* 1_000\) \{ emitTerminal\("boundary-closed"\); return; \}/);
  assert.match(table, /generation/);
  assert.match(table, /if \(!session \|\| terminalOutcome\) return/);
  assert.doesNotMatch(shell, /sectorTable\.(?:queueAction|pointerDown|pointerEnd|setPaused|chooseNarrated|retry|abandon|suspend|resume|orientationChanged|draw|audioGesture|canRetry|isPaused)/);
  assert.match(table, /document\.addEventListener\("pointerdown"/);
  assert.match(table, /document\.addEventListener\("visibilitychange"/);
  assert.match(table, /return Object\.freeze\(\{\s*start,\s*view\(\): SectorSprintTableView[\s\S]*afterRender: mount,[\s\S]*setExitSuspended[\s\S]*close: destroy/);
});
