// Pure heat map logic (spec 001, tasks T1-T2).
//
// Functions here must never touch the DOM or storage: they receive the sessions
// and `todayIso` ("YYYY-MM-DD", user's LOCAL time zone) as arguments (constitution
// rules 3 and 5). Details:
//   - "with study" cells are days <= today inside the 12-week window with T >= 1;
//     future days never count, even if sessions with their date exist (RF-7.1);
//   - the level bands use integers only: compare 4*total against max, so exact
//     25/50/75% borders fall into the HIGHER level and max never needs to be
//     divisible by 4 (RF-2.1);
//   - corrupted sessions are skipped, not trusted, and storage is never touched
//     (RNF-5).
// Classic script + Node bridge (plan decision D2): attached to the window global
// for the browser, exported via CommonJS when required by `node --test`.

(function (root, factory) {
  "use strict";
  if (typeof module !== "undefined" && module.exports) {
    // Node (tests): pull the date helpers directly.
    module.exports = factory(require("./logic-dates.js"));
  } else {
    // Browser: logic-dates.js is loaded first and exposes window.LogicDates.
    root.LogicHeatMap = factory(root.LogicDates);
  }
})(typeof window !== "undefined" ? window : globalThis, function (LogicDates) {
  const WEEKS = 12;

  // First and current Monday of the window: the current week is always the last
  // column, so the window is 12 * 7 days ending on its Sunday (RF-1).
  function heatMapWindowIso(todayIso, weeks = WEEKS) {
    const currentMonday = LogicDates.startOfWeekMondayIso(todayIso);
    const firstDay = LogicDates.shiftDaysIso(currentMonday, -7 * (weeks - 1));
    return { firstDay, currentMonday, weeks };
  }

  // Total minutes per date. Sessions that are not usable (missing fecha, minutos
  // not a finite number) are skipped and never trusted (RNF-5).
  function sumMinutesPerDay(sessions) {
    const totals = new Map();
    for (const session of sessions) {
      if (
        session &&
        typeof session.fecha === "string" &&
        typeof session.minutos === "number" &&
        Number.isFinite(session.minutos) &&
        session.minutos >= 0
      ) {
        totals.set(session.fecha, (totals.get(session.fecha) || 0) + session.minutos);
      }
    }
    return totals;
  }

  // Maximum daily total inside the window, up to today. Sessions outside the
  // window or dated in the future never contribute (RF-7.2, RF-7.3).
  function maxDailyMinutes(totals, firstDayIso, todayIso) {
    let max = 0;
    for (const [fecha, total] of totals) {
      if (fecha >= firstDayIso && fecha <= todayIso && total > max) {
        max = total;
      }
    }
    return max;
  }

  // Level 0..4 for a day total T given the window maximum M (RF-2.1).
  function heatMapLevel(total, max) {
    if (total <= 0 || max <= 0) return 0; // RF-3.2: no proportions without a max
    const scaled = 4 * total; // integer trick: no intermediate decimals
    if (scaled < max) return 1;
    if (scaled < 2 * max) return 2;
    if (scaled < 3 * max) return 3;
    return 4;
  }

  // The complete grid: 84 cells from the first Monday until the current Sunday,
  // oldest week first, Monday to Sunday. Future days render as empty even when
  // sessions with their date exist (RF-7.1). Returns a plain object, ready for
  // the UI layer.
  function buildHeatMap(sessions, todayIso, weeks = WEEKS) {
    const { firstDay } = heatMapWindowIso(todayIso, weeks);
    const totals = sumMinutesPerDay(sessions);
    const max = maxDailyMinutes(totals, firstDay, todayIso);

    const cells = [];
    let iso = firstDay;
    for (let cellIndex = 0; cellIndex < weeks * 7; cellIndex++) {
      const isPastOrToday = iso <= todayIso;
      const stored = isPastOrToday ? totals.get(iso) : 0;
      const total = stored !== undefined ? stored : 0;
      cells.push({
        date: iso,
        minutes: total,
        hasStudy: total >= 1,
        level: heatMapLevel(total, max),
      });
      iso = LogicDates.shiftDaysIso(iso, 1);
    }

    return { cells, max, weeks };
  }

  return {
    WEEKS,
    heatMapWindowIso,
    sumMinutesPerDay,
    maxDailyMinutes,
    heatMapLevel,
    buildHeatMap,
  };
});
