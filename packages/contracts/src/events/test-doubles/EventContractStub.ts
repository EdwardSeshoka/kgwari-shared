import type { EventContract as EventContractShape } from "../event.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * A tasting, dinner or launch.
 *
 * `startDateTime` is UTC ISO 8601 and NEVER a formatted date: "24 July" is a
 * sentence in one language, and a wire that carries it has already chosen the
 * reader's. `seatsAvailable` is a number for the same reason.
 */

export const EventContract = {
  StubFactory: {
    ...defineStub<EventContractShape>({
        id: "event_kanonkop-vertical",
        title: "Kanonkop vertical",
        eventType: "tasting",
        startDateTime: "2026-07-24T17:00:00.000Z",
        venueName: "The Pot Luck Club",
        location: "Cape Town",
        seatsAvailable: 4,
        host: { name: "Alexandra Meyer", tier: "professional", role: "Sommelier" },
        subject: { kind: "producer", producerId: "producer_kanonkop" }}),

    /**
     * Sold out — zero seats, which is a STATEMENT and not missing data.
     *
     * The distinction matters: an absent `seatsAvailable` means the capacity is
     * unknown, and a reader that treats the two alike will advertise a full room.
     */
    makeSoldOut(overrides: Overrides<EventContractShape> = {}): EventContractShape {
      return EventContract.StubFactory.make({ seatsAvailable: 0, ...overrides });
    },

    /** An event with no date set yet — absent, rather than a placeholder date. */
    makeUndated(overrides: Overrides<EventContractShape> = {}): EventContractShape {
      return EventContract.StubFactory.make({
        startDateTime: undefined,
        seatsAvailable: undefined,
        ...overrides
      });
    }
  }
};
