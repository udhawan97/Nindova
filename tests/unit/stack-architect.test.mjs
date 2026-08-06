import assert from "node:assert/strict";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "../..");
const Stack = await import(resolve(root, "apps/house/dist/stack-architect.js"));

test("Stack Architect owns the complete three-plinth law and repair policy", () => {
  const start = Stack.initialPegs(3);
  assert.deepEqual(start, [[3, 2, 1], [], []]);
  assert.equal(Stack.isLegalStackMove(start, 0, 2), true);
  const afterSmall = Stack.moveStackDisc(start, 0, 2);
  assert.deepEqual(afterSmall, [[3, 2], [], [1]]);
  assert.equal(Stack.isLegalStackMove(afterSmall, 0, 2), false);
  assert.equal(Stack.stackSolved([[], [], [3, 2, 1]], 3), true);
  assert.equal(Stack.isValidStackState([[3, 2, 1], [], []], 3), true);
  assert.equal(Stack.isValidStackState([[3, 1], [1], []], 3), false);
  assert.equal(Stack.isValidStackState([[2, 3, 1], [], []], 3), false);
  assert.deepEqual(Stack.restoreStackPegs([[3, 1], [1], []], 3), [[3, 2, 1], [], []]);
});
