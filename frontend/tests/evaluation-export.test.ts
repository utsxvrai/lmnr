import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatTrialsForExport, parseJsonOrRaw, type SerializedTrial } from "@/lib/evaluation/export";

const trial = (overrides: Partial<SerializedTrial> = {}): SerializedTrial => ({
  id: "trial-1",
  taskId: "task-1",
  index: 0,
  executorOutput: "null",
  data: "null",
  target: "null",
  metadata: "{}",
  scores: "{}",
  ...overrides,
});

describe("parseJsonOrRaw", () => {
  it("keeps valid JSON values, including null and falsy ones", () => {
    assert.equal(parseJsonOrRaw("null"), null);
    assert.equal(parseJsonOrRaw("false"), false);
    assert.equal(parseJsonOrRaw("0"), 0);
    assert.equal(parseJsonOrRaw('""'), "");
    assert.deepEqual(parseJsonOrRaw("[1,2]"), [1, 2]);
    assert.deepEqual(parseJsonOrRaw('{"a":{"b":null}}'), { a: { b: null } });
  });

  it("returns the original text when it is not valid JSON", () => {
    assert.equal(parseJsonOrRaw("not json"), "not json");
    assert.equal(parseJsonOrRaw(""), "");
  });
});

describe("formatTrialsForExport", () => {
  it('exports JSON null as null, not the string "null"', () => {
    const [row] = formatTrialsForExport([trial()]);
    assert.equal(row.data, null);
    assert.equal(row.target, null);
    assert.equal(row.executorOutput, null);
    assert.equal(JSON.parse(JSON.stringify([row]))[0].data, null);
  });

  it("preserves falsy values, structures and non-JSON text", () => {
    const [row] = formatTrialsForExport([
      trial({ data: '{"q":[1,2]}', target: "false", executorOutput: "plain text" }),
    ]);
    assert.deepEqual(row.data, { q: [1, 2] });
    assert.equal(row.target, false);
    assert.equal(row.executorOutput, "plain text");
  });

  it("flattens scores into top-level fields and keeps column order", () => {
    const [row] = formatTrialsForExport([trial({ scores: '{"accuracy":1,"relevance":null}' })]);
    assert.deepEqual(Object.keys(row), [
      "id",
      "taskId",
      "index",
      "executorOutput",
      "data",
      "target",
      "metadata",
      "accuracy",
      "relevance",
    ]);
    assert.equal(row.accuracy, 1);
    assert.equal(row.relevance, null);
    assert.equal("scores" in row, false);
  });
});
