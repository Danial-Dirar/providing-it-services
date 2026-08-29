/**
 * Live clocks.
 *
 * The header chip shows New York time and whether the office is open; the hub
 * row shows each delivery hub's local time and its distance from New York.
 * Everything is derived with Intl so it stays correct through daylight saving
 * — which matters here, because Eastern time observes it and the hub cities
 * change over on different dates.
 */

const OFFICE_ZONE = 'America/New_York';
const OPEN_HOUR = 9;
const CLOSE_HOUR = 18;
/** Sunday is 0. The US working week runs Monday to Friday. */
const WORKING_DAYS = new Set([1, 2, 3, 4, 5]);

const timeFormatters = new Map();

function formatter(zone) {
  if (!timeFormatters.has(zone)) {
    timeFormatters.set(
      zone,
      new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: zone,
      }),
    );
  }
  return timeFormatters.get(zone);
}

/** Hour, minute and weekday in a given zone, read back from Intl parts. */
export function zoneParts(zone, date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hour12: false,
    timeZone: zone,
  }).formatToParts(date);

  const get = (type) => parts.find((p) => p.type === type)?.value ?? '';
  const weekdayIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));

  return {
    hour: Number(get('hour')) % 24,
    minute: Number(get('minute')),
    weekday: weekdayIndex,
  };
}

const offsetFormatters = new Map();

/**
 * Minutes a zone is ahead of UTC at a given instant, daylight saving included.
 *
 * Read the instant back as wall-clock parts in the target zone, reinterpret
 * those parts as if they were UTC, and the difference from the real instant is
 * the offset. This is the only way to get it right without shipping a tz table.
 */
export function zoneOffsetMinutes(zone, date = new Date()) {
  if (!offsetFormatters.has(zone)) {
    offsetFormatters.set(
      zone,
      new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: zone,
      }),
    );
  }

  const parts = {};
  for (const part of offsetFormatters.get(zone).formatToParts(date)) {
    if (part.type !== 'literal') parts[part.type] = Number(part.value);
  }

  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour % 24,
    parts.minute,
    parts.second,
  );

  // Drop sub-second precision on both sides so the difference is a clean minute count.
  return Math.round((asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60_000);
}

/** Hours a zone sits ahead of (positive) or behind (negative) the office. */
export function hoursFromOffice(zone, date = new Date()) {
  return (zoneOffsetMinutes(zone, date) - zoneOffsetMinutes(OFFICE_ZONE, date)) / 60;
}

function formatDelta(hours) {
  if (hours === 0) return 'same';
  const rounded = Math.round(hours * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}h`;
}

export function formatZone(zone, date = new Date()) {
  return formatter(zone).format(date).replace(/^24:/, '00:');
}

function isOfficeOpen(date = new Date()) {
  const { hour, weekday } = zoneParts(OFFICE_ZONE, date);
  return WORKING_DAYS.has(weekday) && hour >= OPEN_HOUR && hour < CLOSE_HOUR;
}

export function initClocks() {
  const chips = [...document.querySelectorAll('[data-clock]')];
  const hubRows = [...document.querySelectorAll('[data-hub-zone]')];

  if (!chips.length && !hubRows.length) return;

  function tick() {
    const now = new Date();
    const office = formatZone(OFFICE_ZONE, now);
    const open = isOfficeOpen(now);

    for (const chip of chips) {
      const time = chip.querySelector('[data-clock-time]');
      const dot = chip.querySelector('[data-clock-dot]');
      if (time) time.textContent = office;
      if (dot) dot.dataset.state = open ? 'open' : 'closed';
      chip.title = open
        ? 'The New York office is open now'
        : 'Outside New York office hours — enquiries are answered next working day';
    }

    for (const row of hubRows) {
      const zone = row.dataset.hubZone;
      if (!zone) continue;

      const target = row.querySelector('.hub__time');
      if (target) target.textContent = formatZone(zone, now);

      // The server-rendered offset is a fixed approximation; recompute it here
      // so the label survives every daylight-saving changeover on both sides.
      const delta = row.querySelector('[data-hub-delta]');
      if (delta) delta.textContent = formatDelta(hoursFromOffice(zone, now));
    }
  }

  tick();
  // Align the next update to the top of the minute, then run every minute.
  const msToNextMinute = 60_000 - (Date.now() % 60_000);
  setTimeout(() => {
    tick();
    setInterval(tick, 60_000);
  }, msToNextMinute);
}
