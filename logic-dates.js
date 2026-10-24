// Pure local-calendar helpers for the heat map (spec 001, task T1).
//
// "YYYY-MM-DD" strings identify calendar days in the USER'S LOCAL time zone.
// UTC must never be used to split or move days:
//   - `new Date("YYYY-MM-DD")` is parsed as UTC midnight and shifts days;
//   - `toISOString()` returns UTC dates;
//   - millisecond arithmetic assumes every day has 24 hours, which DST breaks.
// See docs/constitution.md (rules 3 and 5) and the local-dates project skill.
//
// Classic script + Node bridge: attached to the global scope for the browser and
// exported when running under `node --test` (plan decision D2).

(function (globalScope) {
  "use strict";

  function padTwo(number) {
    return String(number).padStart(2, "0");
  }

  // "YYYY-MM-DD" -> local Date at noon. Noon keeps the calendar day stable when
  // daylight saving time starts or ends on that day.
  function localDateFromIso(iso) {
    const parts = iso.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2], 12);
  }

  // Local Date -> "YYYY-MM-DD" using the local calendar fields.
  function isoFromLocalDate(date) {
    return `${date.getFullYear()}-${padTwo(date.getMonth() + 1)}-${padTwo(date.getDate())}`;
  }

  // Shifts a day string by the given number of days, possibly negative.
  // Uses setDate: 24 hours is not always a day (DST), so never use milliseconds.
  function shiftDaysIso(iso, days) {
    const date = localDateFromIso(iso);
    date.setDate(date.getDate() + days);
    return isoFromLocalDate(date);
  }

  // Monday that starts the week containing the given day (ISO 8601: Monday first).
  function startOfWeekMondayIso(iso) {
    const date = localDateFromIso(iso);
    const weekday = date.getDay() === 0 ? 7 : date.getDay(); // Sunday = 7
    return shiftDaysIso(iso, 1 - weekday);
  }

  const LogicDates = {
    localDateFromIso,
    isoFromLocalDate,
    shiftDaysIso,
    startOfWeekMondayIso,
  };

  globalScope.LogicDates = LogicDates;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = LogicDates;
  }
})(typeof window !== "undefined" ? window : globalThis);
