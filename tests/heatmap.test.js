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
