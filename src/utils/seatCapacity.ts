/**
 * Bus layout capacity helpers.
 *
 * Configured size is 20 or 32, but one slot is the blocked driver seat:
 * - 20 layout → passenger seats 1–19 (19 bookable)
 * - 32 layout → passenger seats 1–31 (31 bookable)
 */

export function bookableSeatsPerBus(configuredSeats: number | string | undefined | null): number {
  const n = Number(configuredSeats);
  if (!Number.isFinite(n) || n <= 0) return 0;
  if (n === 20) return 19;
  if (n === 32) return 31;
  // Already a passenger count, or non-standard size
  return n;
}

export function totalBookableCapacity(
  configuredSeats: number | string | undefined | null,
  numberOfBuses: number | string | undefined | null,
): number {
  const buses = Math.max(1, Number(numberOfBuses) || 1);
  return bookableSeatsPerBus(configuredSeats) * buses;
}

/** Highest seat number that exists on the layout (1..N). */
export function maxBookableSeatNumber(
  configuredSeats: number | string | undefined | null,
): number {
  return bookableSeatsPerBus(configuredSeats);
}
