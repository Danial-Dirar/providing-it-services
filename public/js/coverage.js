/**
 * The coverage instrument.
 *
 * A 24-cell band of the visitor's own working day, marked with the hours the
 * New York office is open. The point is that the answer is about the reader —
 * their time zone, computed in their browser — rather than a claim we make.
 */

import { zoneOffsetMinutes } from './clock.js';

const OFFICE_ZONE = 'America/New_York';
const DAY_START = 9;
const DAY_END = 18;

const pad = (n) => String(n).padStart(2, '0');

function localOffsetMinutes(date = new Date()) {
  return -date.getTimezoneOffset();
}

/**
 * Hours to add to a local hour to get the equivalent New York hour.
 *
 * Read live rather than hardcoded: Eastern time observes daylight saving, so a
 * fixed offset would be wrong for roughly a third of the year.
 */
function deltaHours(date = new Date()) {
  return (zoneOffsetMinutes(OFFICE_ZONE, date) - localOffsetMinutes(date)) / 60;
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
    const office = inWorkingHours(mid + delta);

    if (you && office) overlap += 1;

    cells.push({ hour, you, office, state: you && office ? 'both' : you ? 'you' : office ? 'office' : 'off' });
  }

  return { cells, overlap, delta };
}

/**
 * Reads as a continuation of the big number beside it, e.g.
 * "6 hrs of your working day overlap the New York office directly."
 */
function sentenceFor(overlap, delta) {
  const gap = Math.abs(delta);
  const gapText =
    delta === 0
      ? 'You are on New York time.'
      : `New York is ${gap % 1 === 0 ? gap : gap.toFixed(1)} hours ${
          delta > 0 ? 'ahead of' : 'behind'
        } you.`;

  if (overlap === 0) {
    return `of direct overlap with 09:00–18:00 in New York — which is exactly the case our early and late rosters exist for. ${gapText}`;
  }
  if (overlap >= 8) {
    return `of your working day sit inside ours, so a question asked in your morning is answered the same morning. ${gapText}`;
  }
  return `of your working day overlap the New York office directly; the rest is covered by a staggered roster when an account needs it. ${gapText}`;
}

export function initCoverage() {
  const root = document.querySelector('[data-coverage]');
  if (!root) return;

  const cellsHost = root.querySelector('[data-coverage-cells]');
  const hoursHost = root.querySelector('[data-coverage-hours]');
  const zoneLabel = root.querySelector('[data-coverage-zone]');

  const officeOut = document.querySelector('[data-coverage-office]');
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
        cell.office ? 'New York office open' : 'New York office closed'
      }`;
    });

    const officeTime = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: OFFICE_ZONE,
    }).format(now);

    if (officeOut) officeOut.textContent = officeTime;
    if (youOut) youOut.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    if (overlapOut) {
      overlapOut.textContent = overlap === 0 ? '0 hrs' : `${overlap} hrs`;
    }
    if (sentenceOut) sentenceOut.textContent = sentenceFor(overlap, delta);

    cellsHost.setAttribute(
      'aria-label',
      `Working-hour overlap: ${overlap} of your working hours fall inside New York office hours.`,
    );
  }

  render();

  const msToNextMinute = 60_000 - (Date.now() % 60_000);
  setTimeout(() => {
    render();
    setInterval(render, 60_000);
  }, msToNextMinute);
}
