import type { AromaMentionContract as AromaMentionContractShape } from "../register.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * One aroma and how many notes named it. A count of MENTIONS, not a score.
 *
 * `key` is a controlled-vocabulary chrome key (`aroma.wildPlum`), and it is the
 * same key the search index holds. That identity is what makes browsing by aroma
 * work in every locale without one translated word in the index — an aroma sent
 * as text can only ever be searched in the language it was authored in.
 *
 * The three factories are the three tiers, because the tier is not decoration:
 * primary is fruit and flower, secondary is winemaking, tertiary is age. A page
 * that groups by tier is saying something about how the wine got its character,
 * and a consumer with only primary mentions in its fixtures has never rendered
 * the other two groups.
 */
export const AromaMentionContract = {
  StubFactory: {
    ...defineStub<AromaMentionContractShape>({
      key: "aroma.wildPlum",
      tier: "primary",
      mentions: 890
    }),

    /** Winemaking — oak, ferment, lees. */
    makeSecondary(overrides: Overrides<AromaMentionContractShape> = {}): AromaMentionContractShape {
      return AromaMentionContract.StubFactory.make({
        key: "aroma.clove",
        tier: "secondary",
        mentions: 314,
        ...overrides
      });
    },

    /** Age — the tier that only appears once a wine has had some. */
    makeTertiary(overrides: Overrides<AromaMentionContractShape> = {}): AromaMentionContractShape {
      return AromaMentionContract.StubFactory.make({
        key: "aroma.driedFig",
        tier: "tertiary",
        mentions: 47,
        ...overrides
      });
    },

    /**
     * Named once.
     *
     * Legitimate and worth keeping — one member noticing something nobody else
     * did is a fact about the wine, not noise. A client that hides low mentions
     * is editing the register.
     */
    makeNamedOnce(overrides: Overrides<AromaMentionContractShape> = {}): AromaMentionContractShape {
      return AromaMentionContract.StubFactory.make({
        key: "aroma.graphite",
        mentions: 1,
        ...overrides
      });
    }
  }
};
