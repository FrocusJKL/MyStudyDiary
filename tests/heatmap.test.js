// Tests for the pure local-date helpers used by the heat map (spec 001, task T1).
// Run from the project root with: node --test
// Dates reference the example in the spec: Saturday 2026-10-24.

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  localDateFromIso,
  isoFromLocalDate,
  shiftDaysIso,
  startOfWeekMondayIso,
} = require("../logic-dates.js");

test("localDateFromIso builds a local Date at noon from the ISO string", () => {
  const date = localDateFromIso("2026-10-24");
  assert.equal(date.getFullYear(), 2026);
  assert.equal(date.getMonth(), 9); // October = 9
  assert.equal(date.getDate(), 24);
  assert.equal(date.getHours(), 12); // noon, so DST cannot move the day
  assert.equal(date.getMinutes(), 0);
});

test("isoFromLocalDate is the exact inverse of localDateFromIso", () => {
  const dates = [
    "2026-01-01",
    "2026-02-28",
    "2028-02-29", // leap year
    "2026-10-24", // spec example (Saturday)
    "2026-12-31",
  ];
  for (const iso of dates) {
    assert.equal(isoFromLocalDate(localDateFromIso(iso)), iso);
  }
});

test("localDateFromIso reads calendar fields, not UTC", () => {
  const date = localDateFromIso("2026-10-24");
  assert.equal(isoFromLocalDate(date), "2026-10-24");
});

test("shiftDaysIso crosses month, year and leap boundaries without drift", () => {
  assert.equal(shiftDaysIso("2026-03-01", -1), "2026-02-28");
  assert.equal(shiftDaysIso("2028-02-29", 1), "2028-03-01");
  assert.equal(shiftDaysIso("2026-12-31", 1), "2027-01-01");
  assert.equal(shiftDaysIso("2026-01-01", -1), "2025-12-31");
});

test("shiftDaysIso moves exactly one day across the DST change (2026-10-25)", () => {
  // The last Sunday of October (2026-10-25) ends daylight saving time in Spain:
  // 24 hours is not always a day, so setDate (not milliseconds) must be used.
  assert.equal(shiftDaysIso("2026-10-24", 1), "2026-10-25");
  assert.equal(shiftDaysIso("2026-10-24", 2), "2026-10-26");
  assert.equal(shiftDaysIso("2026-10-26", -2), "2026-10-24");
});

test("startOfWeekMondayIso returns the Monday of the same week", () => {
  assert.equal(startOfWeekMondayIso("2026-10-19"), "2026-10-19"); // Monday: itself
  assert.equal(startOfWeekMondayIso("2026-10-24"), "2026-10-19"); // Saturday: 5 days back
  assert.equal(startOfWeekMondayIso("2026-10-25"), "2026-10-19"); // Sunday (DST day)
  assert.equal(startOfWeekMondayIso("2026-10-18"), "2026-10-12"); // previous week
  assert.equal(startOfWeekMondayIso("2026-01-03"), "2025-12-29"); // crosses new year
});

// ---------------------------------------------------------------------------
// Pure heat map logic (spec 001, task T2). Spec example: today = 2026-10-24
// (Saturday) -> 12-week window starting on Monday 2026-08-03. All dates fixed:
// no test depends on the real clock.
// ---------------------------------------------------------------------------

const {
  heatMapWindowIso,
  sumMinutesPerDay,
  maxDailyMinutes,
  heatMapLevel,
  buildHeatMap,
} = require("../logic-heatmap.js");

const TODAY = "2026-10-24"; // Saturday
const FIRST_MONDAY = "2026-08-03"; // Monday, 12 weeks including the current one

test("heatMapWindowIso starts 12 weeks back, on a Monday (RF-1)", () => {
  const window = heatMapWindowIso(TODAY, 12);
  assert.equal(window.currentMonday, "2026-10-19");
  assert.equal(window.firstDay, FIRST_MONDAY);
  // 84 days apart, window end is the Sunday of the current week
  assert.notEqual(window.firstDay, "2026-08-10"); // that would be 11 weeks
});

test("buildHeatMap returns 84 unique consecutive cells ending at the current Sunday (RF-1.1)", () => {
  const { cells } = buildHeatMap([], TODAY, 12);
  assert.equal(cells.length, 84);
  assert.equal(cells[0].date, FIRST_MONDAY);
  assert.equal(cells[83].date, "2026-10-25"); // Sunday of the current week
  const dates = new Set(cells.map((cell) => cell.date));
  assert.equal(dates.size, 84);
  // consecutive: every cell is the next day of the previous one
  for (let i = 1; i < cells.length; i++) {
    assert.notEqual(cells[i].date, cells[i - 1].date);
  }
});

test("empty history: all cells level 0, max 0 (RF-1.1, RF-3.2)", () => {
  const { cells, max } = buildHeatMap([], TODAY, 12);
  assert.equal(max, 0);
  for (const cell of cells) {
    assert.equal(cell.minutes, 0);
    assert.equal(cell.level, 0);
    assert.equal(cell.hasStudy, false);
  }
});

test("today is inside the window and lands on the current week column (RF-1.3)", () => {
  const { cells } = buildHeatMap([{ fecha: TODAY, minutos: 30 }], TODAY, 12);
  const todayCell = cells.filter((cell) => cell.hasStudy);
  assert.equal(todayCell.length, 1);
  assert.equal(todayCell[0].date, TODAY);
  assert.equal(todayCell[0].level, 4);
});

test("heatMapLevel bands with integer convention, 25/50/75% belong to the higher level (RF-2.1)", () => {
  const bands = [
    [0, 0], [24, 1], [25, 2], [49, 2], [50, 3], [74, 3], [75, 4], [100, 4],
  ];
  for (const [total, expected] of bands) {
    assert.equal(heatMapLevel(total, 100), expected, `total ${total} with M=100`);
  }
  assert.equal(heatMapLevel(12, 50), 1); // 48 < 50
  assert.equal(heatMapLevel(13, 50), 2); // 52 >= 50 (M not divisible by 4)
  assert.equal(heatMapLevel(7, 0), 0); // no max -> no proportions
  assert.equal(heatMapLevel(0, 0), 0);
});

test("tied daily maximums all get level 4 (RF-2.3)", () => {
  const sessions = [
    { fecha: "2026-10-19", minutos: 60 },
    { fecha: "2026-10-20", minutos: 60 },
  ];
  const { cells, max } = buildHeatMap(sessions, TODAY, 12);
  assert.equal(max, 60);
  for (const cell of cells) {
    if (cell.date === "2026-10-19" || cell.date === "2026-10-20") {
      assert.equal(cell.hasStudy, true);
      assert.equal(cell.level, 4, `${cell.date} should be level 4`);
    }
  }
});

test("everything at the maximum: all studied cells are level 4, legend colors unchanged (RF-2.4)", () => {
  const sessions = ["2026-10-19", "2026-10-20", "2026-10-21"].map((fecha) => ({
    fecha,
    minutos: 60,
  }));
  const { cells, max } = buildHeatMap(sessions, TODAY, 12);
  assert.equal(max, 60);
  const studied = cells.filter((cell) => cell.hasStudy);
  assert.equal(studied.length, 3);
  for (const cell of studied) assert.equal(cell.level, 4);
});

test("recomputing with a new record recalculates every level from data (RF-2.2)", () => {
  const before = buildHeatMap([{ fecha: TODAY, minutos: 20 }], TODAY, 12);
  assert.equal(before.max, 20);
  const todayCellBefore = before.cells.filter((cell) => cell.hasStudy)[0];
  assert.equal(todayCellBefore.date, TODAY);
  assert.equal(todayCellBefore.level, 4); // the only studied day IS the max

  const after = buildHeatMap(
    [
      { fecha: TODAY, minutos: 20 },
      { fecha: "2026-10-23", minutos: 80 }, // new record, inside the window
    ],
    TODAY,
    12
  );
  assert.equal(after.max, 80);
  const todayAfter = after.cells.filter((cell) => cell.date === TODAY)[0];
  assert.equal(todayAfter.level, 2); // 4 * 20 = 80, now exactly M -> level 2
});

test("future sessions are ignored: not painted, not part of the max (RF-6.2, RF-7.1, RF-7.3)", () => {
  const { cells, max } = buildHeatMap(
    [{ fecha: "2026-10-25", minutos: 90 }], // tomorrow: future day
    TODAY,
    12
  );
  assert.equal(max, 0); // never contributes to M
  const futureCell = cells[83]; // 2026-10-25
  assert.equal(futureCell.hasStudy, false); // future even with data
  assert.equal(futureCell.level, 0);
  for (const cell of cells) {
    assert.equal(cell.hasStudy, false);
    assert.equal(cell.level, 0);
  }
});

test("sessions older than the window are excluded; the first Monday is included (RF-7.2)", () => {
  const { cells, max } = buildHeatMap(
    [
      { fecha: "2026-08-02", minutos: 30 }, // one day before the window
      { fecha: FIRST_MONDAY, minutos: 90 }, // exactly the first Monday: included
    ],
    TODAY,
    12
  );
  assert.equal(max, 90); // the border session IS part of M
  const borderCell = cells[0];
  assert.equal(borderCell.date, FIRST_MONDAY);
  assert.equal(borderCell.hasStudy, true);
  assert.equal(borderCell.level, 4);
  const outsideCell = cells.filter((cell) => cell.date === "2026-08-02");
  assert.equal(outsideCell.length, 0); // simply not part of the grid
  assert.equal(cells.every((cell) => cell.hasStudy || cell.date !== "2026-08-02"), true);
});

test("several sessions on the same day accumulate into the day total (RF-4.3)", () => {
  const { cells, max } = buildHeatMap(
    [
      { fecha: TODAY, minutos: 30 },
      { fecha: TODAY, minutos: 45 },
    ],
    TODAY,
    12
  );
  const todayCell = cells.filter((cell) => cell.date === TODAY)[0];
  assert.equal(todayCell.minutes, 75);
  assert.equal(max, 75);
  assert.equal(todayCell.hasStudy, true);
});

test("corrupted sessions are skipped: no crash, no wrong totals (RNF-5)", () => {
  const { cells } = buildHeatMap(
    [
      { fecha: TODAY, minutos: 30 }, // valid
      { minutos: 20 }, // missing fecha
      { fecha: 123, minutos: 20 }, // fecha not a string
      { fecha: "2026-10-24", minutos: "30" }, // minutos not a number
      { fecha: "2026-10-24", minutos: -5 }, // absurd minutes, not trusted
      null, // not even an object
    ],
    TODAY,
    12
  );
  const todayCell = cells.filter((cell) => cell.date === TODAY)[0];
  assert.equal(todayCell.minutes, 30);
  assert.equal(todayCell.level, 4);
});

