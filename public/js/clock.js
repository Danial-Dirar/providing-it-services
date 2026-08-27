/**
 * Live clocks.
 *
 * The header chip shows Dhaka time and whether the office is open; the hub row
 * on the home page shows each delivery hub's local time. Everything is derived
 * with Intl so it stays correct through daylight saving in the hub cities.
 */

const DHAKA_ZONE = 'Asia/Dhaka';
const OPEN_HOUR = 9;
const CLOSE_HOUR = 18;
/** Sunday is 0. The Bangladeshi working week runs Sunday to Thursday. */
const WORKING_DAYS = new Set([0, 1, 2, 3, 4]);

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

export function formatZone(zone, date = new Date()) {
  return formatter(zone).format(date).replace(/^24:/, '00:');
}

function isOfficeOpen(date = new Date()) {
  const { hour, weekday } = zoneParts(DHAKA_ZONE, date);
  return WORKING_DAYS.has(weekday) && hour >= OPEN_HOUR && hour < CLOSE_HOUR;
}

export function initClocks() {
  const chips = [...document.querySelectorAll('[data-clock]')];
  const hubRows = [...document.querySelectorAll('[data-hub-zone]')];

  if (!chips.length && !hubRows.length) return;

  function tick() {
    const now = new Date();
    const dhaka = formatZone(DHAKA_ZONE, now);
    const open = isOfficeOpen(now);

    for (const chip of chips) {
      const time = chip.querySelector('[data-clock-time]');
      const dot = chip.querySelector('[data-clock-dot]');
      if (time) time.textContent = dhaka;
      if (dot) dot.dataset.state = open ? 'open' : 'closed';
      chip.title = open
        ? 'The Dhaka office is open now'
        : 'Outside Dhaka office hours — enquiries are answered next working day';
    }

    for (const row of hubRows) {
      const zone = row.dataset.hubZone;
      const target = row.querySelector('.hub__time');
      if (zone && target) target.textContent = formatZone(zone, now);
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
