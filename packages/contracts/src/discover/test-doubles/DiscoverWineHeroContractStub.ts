import type { DiscoverWineHeroContract as DiscoverWineHeroContractShape } from "../wineHero.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";
import { WineContract } from "../../catalog/test-doubles/index.js";

/**
 * The home hero, when what it features is a wine.
 *
 * It carries the FULL `WineContract` rather than a flattened copy of the few
 * fields a hero happens to show — so the hero's verdict, provenance and trust
 * source are the same values the wine row would render, and cannot disagree with
 * them. Composed from the published wine double for the same reason.
 *
 * `primaryAction` / `secondaryAction` are kinds, never labels: a verb composed
 * here is a verb no translator can reach.
 */

export const DiscoverWineHeroContract = {
  StubFactory: {
    ...defineStub<DiscoverWineHeroContractShape>({
        kind: "wine",
        issueLabel: "No. 47",
        kicker: "This week's pick",
        title: "Rubicon, once more.",
        description:
          "Four Bordeaux varieties, pouring generously after three hours in the decanter.",
        wine: WineContract.StubFactory.make(),
        primaryAction: { kind: "request_taste", enabled: true },
        secondaryAction: { kind: "add_to_cellar", enabled: true }}),

    /**
     * A hero whose actions are present but DISABLED — the wine is featured and
     * not currently obtainable.
     *
     * Distinct from omitting them: absent means the hero offers no such action at
     * all, disabled means it offers one that cannot be taken right now, and a
     * reader that renders the two alike either hides a button or lies about it.
     */
    makeUnavailable(overrides: Overrides<DiscoverWineHeroContractShape> = {}): DiscoverWineHeroContractShape {
      return DiscoverWineHeroContract.StubFactory.make({
        primaryAction: { kind: "request_taste", enabled: false },
        secondaryAction: { kind: "add_to_cellar", enabled: false },
        ...overrides
      });
    }
  }
};
