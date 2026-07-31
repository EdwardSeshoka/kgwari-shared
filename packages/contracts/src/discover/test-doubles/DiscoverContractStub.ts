import type { DiscoverContract as DiscoverContractShape } from "../discover.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";
import { WineContract } from "../../catalog/test-doubles/index.js";
import { DiscoverWineHeroContract } from "./DiscoverWineHeroContractStub.js";
import { DiscoverDoorwayContract } from "./DiscoverDoorwayContractStub.js";

/**
 * The whole Discover payload: a hero, and the funnel beneath it.
 *
 * `hero` is nullable and that is a real state — a day with nothing featured is
 * not an error, and a reader must render the funnel without one.
 *
 * Sections are a discriminated union on `type`, so a section cannot claim to hold
 * wines while carrying doorways. A reader is expected to SKIP a `type` it does
 * not know rather than fail, which is what lets the funnel gain a band before
 * every client can render it — see `makeWithUnknownSection`.
 */

export const DiscoverContract = {
  StubFactory: {
    ...defineStub<DiscoverContractShape>({
        hero: DiscoverWineHeroContract.StubFactory.make(),
        sections: [
          {
            id: "act",
            type: "wines",
            title: "Worth opening now",
            items: [WineContract.StubFactory.make()]
          },
          {
            id: "explore",
            type: "doorways",
            title: "Ways in",
            items: [DiscoverDoorwayContract.StubFactory.make()]
          }
        ]}),

    /** A day with nothing featured. The funnel still has to render. */
    makeWithoutHero(overrides: Overrides<DiscoverContractShape> = {}): DiscoverContractShape {
      return DiscoverContract.StubFactory.make({ hero: null, ...overrides });
    },

    /**
     * A section type this reader does not know.
     *
     * The forward-compatibility case: skip the band, render the rest. Cast because
     * the value is deliberately outside today's union — that is the scenario, and
     * a stub unable to express it leaves the skip-unknown rule untested.
     */
    makeWithUnknownSection(overrides: Overrides<DiscoverContractShape> = {}): DiscoverContractShape {
      const base = DiscoverContract.StubFactory.make();
      return DiscoverContract.StubFactory.make({
        sections: [
          ...base.sections,
          { id: "future", type: "podcasts", title: "Listen", items: [] } as unknown as
            DiscoverContractShape["sections"][number]
        ],
        ...overrides
      });
    }
  }
};
