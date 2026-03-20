const { DateTime } = require("luxon");

function dateFilter(dateObj) {
  return DateTime.fromJSDate(dateObj, { zone: "utc+1" })
    .setLocale("pl")
    .setZone("Poland", { keepLocalTime: true })
    .toLocaleString({ day: "numeric", month: "long", year: "numeric" });
}

module.exports = dateFilter;
