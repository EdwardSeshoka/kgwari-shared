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

    /**
     * An enthusiast's evening — created, invited to, and NOT on Discover.
     *
     * The restriction is on reach and not on the verb: this is the whole feature
     * minus the audience, which is why it carries a host, a venue and seats like
     * any other. A consumer that treats `visibility: "private"` as a draft or an
     * error state has read the rule backwards.
     */
    makePrivate(overrides: Overrides<EventContractShape> = {}): EventContractShape {
      return EventContract.StubFactory.make({
        id: "event_supper-for-six",
        title: "Supper for six",
        visibility: "private",
        host: { name: "Sipho Ndlovu", status: "enthusiast" },
        booking: undefined,
        ...overrides
      });
    },

    /** An event with no date set yet — absent, rather than a placeholder date. */
    makeUndated(overrides: Overrides<EventContractShape> = {}): EventContractShape {
      return EventContract.StubFactory.make({
        startDateTime: undefined,
        seatsAvailable: undefined,
        ...overrides
      });
    },

    /**
     * The event as the editorial announcement carries it — venue with its room,
     * a panel in running order, an admission rule, and booking that leaves.
     *
     * The list-row default above is deliberately thinner, because that is what
     * "Pouring near you" actually receives. This is the shape the detail page
     * gets, and shipping it as its own factory is what stops a consumer assuming
     * either one is the whole contract.
     *
     * `timezone` is the VENUE'S. A test that drops it is a test that cannot
     * catch a client silently converting to the reader's zone and being wrong
     * about which evening the dinner is on.
     */
    makeAnnounced(overrides: Overrides<EventContractShape> = {}): EventContractShape {
      return EventContract.StubFactory.make({
        endDateTime: "2026-07-24T21:00:00.000Z",
        timezone: "Africa/Johannesburg",
        venue: {
          name: { source: "canonical", text: "The Pot Luck Club" },
          room: { source: "canonical", text: "The Cellar" },
          city: { source: "canonical", text: "Cape Town" },
          countryCode: "ZA"
        },
        languages: ["en", "af"],
        admission: "ticketed",
        capacity: 24,
        taken: 20,
        seatsAvailable: 4,
        lifecycle: "open",
        panel: [
          {
            name: { source: "canonical", text: "Abrie Beeslaar" },
            tier: "producer",
            role: { source: "negotiated", text: "Cellarmaster", languageTag: "en" },
            house: { source: "canonical", text: "Kanonkop" }
          },
          {
            name: { source: "canonical", text: "Alexandra Meyer" },
            tier: "professional",
            role: { source: "negotiated", text: "In conversation with", languageTag: "en" }
          }
        ],
        booking: {
          claimant: { source: "canonical", text: "The Pot Luck Club" },
          actionKey: "booking.buyTickets",
          url: "https://potluckclub.example/tickets/kanonkop-vertical"
        },
        ...overrides
      });
    },

    /**
     * Cancelled — one of the two lifecycles that is RECORDED rather than derived.
     *
     * The clock cannot imply it: the start time is still in the future and the
     * seats still exist. A consumer that computes lifecycle from dates and counts
     * will show this evening as open and sell somebody a seat at it.
     */
    makeCancelled(overrides: Overrides<EventContractShape> = {}): EventContractShape {
      return EventContract.StubFactory.make({
        lifecycle: "cancelled",
        booking: undefined,
        ...overrides
      });
    },

    /**
     * Filed after the fact: a past event carrying its recap.
     *
     * The recap has its OWN byline and its OWN `filedAt`, which is the point —
     * the host advertised the evening, somebody else wrote up what happened, and
     * a consumer that renders `host` over the recap attributes one person's
     * account to the other.
     */
    makeWithRecap(overrides: Overrides<EventContractShape> = {}): EventContractShape {
      return EventContract.StubFactory.make({
        lifecycle: "past",
        seatsAvailable: 0,
        notesFiled: 37,
        recap: {
          body: [
            {
              source: "negotiated",
              text: "Six vintages, and the room disagreed loudest about the oldest.",
              languageTag: "en"
            }
          ],
          byline: { name: "Thandi Mokoena", status: "collector" },
          filedAt: "2026-07-26T08:12:00.000Z"
        },
        ...overrides
      });
    }
  }
};
