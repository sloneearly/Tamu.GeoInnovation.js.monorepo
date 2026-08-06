import { EventSeason } from '@tamu-gisc/ts/events/ngx';

import { DiscoverApplication, InternalDiscoverApplication } from '../interfaces/discover-application.interface';

/**
 * Builds the router commands used to navigate to a map application. Events live under `/events`,
 * everything else (parking, operations) is routed under its own type segment.
 */
export function getApplicationRoute(app: InternalDiscoverApplication): string[] {
  const routeSegment = app.type === 'event' ? 'events' : app.type;
  return [`/${routeSegment}`, app.id];
}

/**
 * Splits a list of applications into two roughly even columns for the two-column link layouts.
 */
export function buildApplicationColumns(apps: InternalDiscoverApplication[]): InternalDiscoverApplication[][] {
  const midpoint = Math.ceil(apps.length / 2);
  return [apps.slice(0, midpoint), apps.slice(midpoint)];
}

/**
 * Index the second ordered-list column should start at so numbering continues across columns.
 */
export function getSecondColumnStart(columns: InternalDiscoverApplication[][]): number {
  return columns[0].length + 1;
}

export function sortApplicationsByName<T extends DiscoverApplication>(apps: T[]): T[] {
  return [...apps].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Parses the various supported event date representations (epoch, Date, or string) into epoch ms.
 * Date-only strings (`YYYY-MM-DD`) are parsed in local time to avoid timezone drift.
 */
export function parseEventDate(date: string | Date | number): number {
  if (typeof date === 'number') {
    return date;
  }

  if (date instanceof Date) {
    return date.getTime();
  }

  const dateOnlyMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
  }

  return new Date(date).getTime();
}

/**
 * Returns a human-readable date range (or single date) for an event's configured dates.
 */
export function getEventDateRange(dates: Array<string | Date | number>): string {
  if (!dates || dates.length === 0) {
    return 'No dates available';
  }

  const parsedDates = dates.map((date) => parseEventDate(date)).sort((a, b) => a - b);
  const startDate = new Date(parsedDates[0]);
  const endDate = new Date(parsedDates[parsedDates.length - 1]);

  if (parsedDates.length === 1) {
    return startDate.toLocaleDateString();
  }

  return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
}

/**
 * Academic season boundaries, expressed as the last `[month, day]` of each season. Chosen to match
 * the university calendar rather than the meteorological one: spring runs through the May
 * commencement ceremonies, and the fall term opens with the mid-August residence hall move-in.
 */
const SEASON_END_DATES: Array<{ season: EventSeason; month: number; day: number }> = [
  { season: 'spring', month: 5, day: 31 },
  { season: 'summer', month: 8, day: 14 }
];

/**
 * Derives the academic season an event falls in from its configured dates, using the earliest date
 * so that an event spanning a season boundary is filed under the season it starts in.
 *
 * Returns `undefined` when the event has no usable dates — those maps declare a `season` explicitly
 * in their discover metadata instead.
 */
export function deriveEventSeason(dates: Array<string | Date | number>): EventSeason | undefined {
  if (!dates || dates.length === 0) {
    return undefined;
  }

  const earliest = dates
    .map((date) => parseEventDate(date))
    .filter((time) => Number.isFinite(time))
    .sort((a, b) => a - b)[0];

  if (earliest === undefined) {
    return undefined;
  }

  const date = new Date(earliest);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const match = SEASON_END_DATES.find((boundary) => month < boundary.month || (month === boundary.month && day <= boundary.day));

  return match ? match.season : 'fall';
}

/**
 * Filters out events whose dates are entirely in the past. Events without dates are kept.
 */
export function filterUpcomingEvents(apps: InternalDiscoverApplication[]): InternalDiscoverApplication[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  return apps.filter((app) => {
    const dates = app.configuration.eventDates;
    if (!dates || dates.length === 0) return true;
    return dates.some((date) => parseEventDate(date) >= todayMs);
  });
}
