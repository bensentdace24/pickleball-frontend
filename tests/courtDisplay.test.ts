import assert from "node:assert/strict";
import { test } from "node:test";
import { getCourtTeams } from "../src/lib/courtDisplay.ts";

test("getCourtTeams preserves singles and doubles sides from the API", () => {
  const player = (id: number) => ({ id, name: `Player ${id}` });
  const teams = getCourtTeams({
    team_a: { players: [player(1), player(2)] },
    team_b: { players: [player(3), player(4)] },
    players: [player(1), player(2), player(3), player(4)],
  });

  assert.equal(teams.format, "Doubles");
  assert.deepEqual(teams.teamA.map((p) => p.id), [1, 2]);
  assert.deepEqual(teams.teamB.map((p) => p.id), [3, 4]);
});

test("getCourtTeams infers the format and side split when only players exist", () => {
  const player = (id: number) => ({ id, name: `Player ${id}` });
  const teams = getCourtTeams({
    players: [player(1), player(2)],
  });

  assert.equal(teams.format, "Singles");
  assert.deepEqual(teams.teamA.map((p) => p.id), [1]);
  assert.deepEqual(teams.teamB.map((p) => p.id), [2]);
});
