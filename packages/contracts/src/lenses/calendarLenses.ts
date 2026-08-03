import { LENS_ALL } from "./lensAll.js";

/**
 * The calendar — asked WHEN, and once asked WHAT.
 *
 * `lens.seatsLeft` is an ATTRIBUTE lens sitting in a row of time lenses, and it
 * is here to prove the mechanism generalises without a new shape: a lens narrows
 * a stream, and nothing about that requires the question to be about dates.
 */
export const CALENDAR_LENSES = [
  LENS_ALL,
  "lens.thisMonth",
  "lens.later",
  "lens.seatsLeft"
] as const;

export type CalendarLensKey = (typeof CALENDAR_LENSES)[number];
