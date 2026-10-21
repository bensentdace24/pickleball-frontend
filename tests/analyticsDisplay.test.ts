import assert from "node:assert/strict";
import { test } from "node:test";
import { getChartSegments } from "../src/lib/analyticsDisplay.ts";

test("getChartSegments scales values against the highest group", () => {
  assert.deepEqual(
    getChartSegments([
      { label: "Singles", value: 4 },
      { label: "Doubles", value: 8 },
    ]).map(({ percent }) => percent),
    [50, 100],
  );
});

test("getChartSegments handles empty and zero-value groups", () => {
  assert.deepEqual(getChartSegments([]), []);
  assert.deepEqual(
    getChartSegments([{ label: "Close", value: 0 }]),
    [{ label: "Close", value: 0, percent: 0 }],
  );
});
