/**
 * The coverage instrument.
 *
 * A 24-cell band of the visitor's own working day, marked with the hours the
 * Dhaka office is open. The point is that the answer is about the reader —
 * their time zone, computed in their browser — rather than a claim we make.
 */

const DHAKA_OFFSET_MINUTES = 360; // UTC+6, no daylight saving in Bangladesh.
const DAY_START = 9;
const DAY_END = 18;

const pad = (n) => String(n).padStart(2, '0');

function localOffsetMinutes(date = new Date()) {
  return -date.getTimezoneOffset();
}

/** Hours to add to a local hour to get the equivalent Dhaka hour. */
function deltaHours(date = new Date()) {
  return (DHAKA_OFFSET_MINUTES - localOffsetMinutes(date)) / 60;
}

function inWorkingHours(hour) {
  const h = ((hour % 24) + 24) % 24;
  return h >= DAY_START && h < DAY_END;
}

function buildModel(date = new Date()) {
  const delta = deltaHours(date);
  const cells = [];
  let overlap = 0;

  for (let hour = 0; hour < 24; hour += 1) {
    // Sample the middle of the hour so half-hour zone offsets land correctly.
    const mid = hour + 0.5;
    const you = inWorkingHours(mid);
    const dhaka = inWorkingHours(mid + delta);

    if (you && dhaka) overlap += 1;

    cells.push({ hour, you, dhaka, state: you && dhaka ? 'both' : you ? 'you' : dhaka ? 'dhaka' : 'off' });
  }

  return { cells, overlap, delta };
}

/**
 * Reads as a continuation of the big number beside it, e.g.
 * "6 hrs of your working day overlap the Dhaka office directly."
 */
function sentenceFor(overlap, delta) {
  const gap = Math.abs(delta);
  const gapText =
    delta === 0
      ? 'You are on Dhaka time.'
      : `Dhaka is ${gap % 1 === 0 ? gap : gap.toFixed(1)} hours ${
          delta > 0 ? 'ahead of' : 'behind'
        } you.`;

  if (overlap === 0) {
    return `of direct overlap with 09:00–18:00 in Dhaka — which is exactly the case our shifted rosters exist for. ${gapText}`;
  }
  if (overlap >= 8) {
    return `of your working day sit inside ours, so a question asked in your morning is answered the same morning. ${gapText}`;
  }
  return `of your working day overlap the Dhaka office directly; the rest is covered by a shifted roster when an account needs it. ${gapText}`;
}

export function initCoverage() {
  const root = document.querySelector('[data-coverage]');
  if (!root) return;

  const cellsHost = root.querySelector('[data-coverage-cells]');
  const hoursHost = root.querySelector('[data-coverage-hours]');
  const zoneLabel = root.querySelector('[data-coverage-zone]');

  const dhakaOut = document.querySelector('[data-coverage-dhaka]');
  const youOut = document.querySelector('[data-coverage-you]');
  const overlapOut = document.querySelector('[data-coverage-overlap]');
  const sentenceOut = document.querySelector('[data-coverage-sentence]');

  if (!cellsHost) return;

  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'your time zone';
  if (zoneLabel) zoneLabel.textContent = zone.replace(/_/g, ' ');

  // Build the 24 cells once; only the "now" marker and the clocks change.
  const cellNodes = [];
  const fragment = document.createDocumentFragment();
  for (let hour = 0; hour < 24; hour += 1) {
    const cell = document.createElement('span');
    cell.className = 'band__cell';
    fragment.append(cell);
    cellNodes.push(cell);
  }
  cellsHost.append(fragment);

  if (hoursHost) {
    const hoursFragment = document.createDocumentFragment();
    for (let hour = 0; hour < 24; hour += 1) {
      const label = document.createElement('span');
      label.className = 'band__hour';
      const inner = document.createElement('span');
      inner.textContent = pad(hour);
      label.append(inner);
      hoursFragment.append(label);
    }
    hoursHost.append(hoursFragment);
  }

  function render() {
    const now = new Date();
    const { cells, overlap, delta } = buildModel(now);
    const currentHour = now.getHours();

    cells.forEach((cell, index) => {
      const node = cellNodes[index];
      node.dataset.on = cell.state;
      node.dataset.now = String(index === currentHour);
      node.title = `${pad(cell.hour)}:00 your time — ${
        cell.dhaka ? 'Dhaka office open' : 'Dhaka office closed'
      }`;
    });

    const dhakaTime = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Dhaka',
    }).format(now);

    if (dhakaOut) dhakaOut.textContent = dhakaTime;
    if (youOut) youOut.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    if (overlapOut) {
      overlapOut.textContent = overlap === 0 ? '0 hrs' : `${overlap} hrs`;
    }
    if (sentenceOut) sentenceOut.textContent = sentenceFor(overlap, delta);

    cellsHost.setAttribute(
      'aria-label',
      `Working-hour overlap: ${overlap} of your working hours fall inside Dhaka office hours.`,
    );
  }

  render();

  const msToNextMinute = 60_000 - (Date.now() % 60_000);
  setTimeout(() => {
    render();
    setInterval(render, 60_000);
  }, msToNextMinute);
}
