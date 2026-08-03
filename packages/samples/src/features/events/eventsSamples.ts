import type { EventContract, ListEventsResponse } from "@edwardseshoka/contracts/events";

import rawEvents from "./events.json" with { type: "json" };
import rawCalendar from "./calendar-landing.json" with { type: "json" };

/** Sample events content — the events service's own sample. */
export const eventsSamples = {
  events: rawEvents as EventContract[],
  /**
   * The CALENDAR landing — the diary, soonest first.
   *
   * It reads FORWARD, unlike every other landing, which reads back from now. A
   * cancelled evening still appears: somebody may have been planning around it.
   */
  calendarLanding: rawCalendar as unknown as ListEventsResponse
} as const;
