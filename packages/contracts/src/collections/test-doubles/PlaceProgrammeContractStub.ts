import type { ListPlaceProgrammeResponse as ListPlaceProgrammeResponseShape } from "../placeProgramme.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * What is on at a place, as the draft's stop picker receives it.
 *
 * The base is Kanonkop with two evenings on a weekend somebody is planning — two
 * rather than one, because a picker that renders a single option is a picker whose
 * list layout was never exercised.
 *
 * `makeNothingOn` is the variant that matters most, and it is the one a suite will
 * forget: most estates have nothing listed for most weekends, and an empty
 * programme is a normal answer rather than a failure. A stop with nothing on is
 * still a complete stop — you walk in.
 */

const programmeStub = defineStub<ListPlaceProgrammeResponseShape>({
  items: [
    {
      eventId: "event_kanonkop-pinotage-ten-vintages",
      title: { source: "negotiated", text: "Pinotage, ten vintages", languageTag: "en" },
      startDateTime: "2026-08-22T09:00:00.000Z"
    },
    {
      eventId: "event_kanonkop-braai-paul-sauer",
      title: { source: "negotiated", text: "Braai and the Paul Sauer", languageTag: "en" },
      startDateTime: "2026-08-23T11:00:00.000Z"
    }
  ]
});

export const PlaceProgrammeContract = {
  StubFactory: {
    ...programmeStub,

    /**
     * An estate with nothing listed.
     *
     * `items: []` and NOT an absent field — the array is required, and empty is the
     * honest answer to "what is on here". This is the double that keeps a client
     * from rendering "no results" as an error, or worse, hiding the stop.
     *
     * No `nextCursor`, because there is nothing to page through. A consumer that
     * treats a missing cursor as "more to come" loops forever on this fixture.
     */
    makeNothingOn(
      overrides: Overrides<ListPlaceProgrammeResponseShape> = {}
    ): ListPlaceProgrammeResponseShape {
      return programmeStub.make({ items: [], nextCursor: undefined, ...overrides });
    },

    /**
     * An evening with no fixed start.
     *
     * A walk-in cellar door runs all day, so `startDateTime` is absent — and it is
     * the field a picker most wants to sort and label by. A consumer that formats it
     * unconditionally prints "Invalid Date" here, which is the bug this exists to
     * find.
     */
    makeUntimed(
      overrides: Overrides<ListPlaceProgrammeResponseShape> = {}
    ): ListPlaceProgrammeResponseShape {
      return programmeStub.make({
        items: [
          {
            eventId: "event_meerlust-cellar-door",
            title: { source: "negotiated", text: "Cellar door tasting", languageTag: "en" }
          }
        ],
        ...overrides
      });
    },

    /**
     * A page with more behind it.
     *
     * An estate in high season lists more than one screen of evenings. The cursor is
     * opaque and a consumer must not parse it — it exists here so pagination is
     * exercised at all.
     */
    makePaged(
      overrides: Overrides<ListPlaceProgrammeResponseShape> = {}
    ): ListPlaceProgrammeResponseShape {
      return programmeStub.make({ nextCursor: "cursor_programme_2", ...overrides });
    }
  }
};
