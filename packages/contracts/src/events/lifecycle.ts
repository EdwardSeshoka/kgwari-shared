/**
 * Where an event has got to.
 *
 * Mostly DERIVED — from the clock and the counts, so nobody has to remember to
 * move it. `open` becomes `full` when `taken` reaches `capacity` and `past` when
 * the end time passes, and a server that recomputes on read cannot drift.
 *
 * Two are RECORDED, because no clock implies them: `announced` is a host saying
 * "this is happening, details to come" before there is anything to book, and
 * `cancelled` is a decision. Deriving either would mean inferring intent from
 * missing data.
 */
export type EventLifecycleContract =
  | "announced"
  | "open"
  | "full"
  | "past"
  | "cancelled";
