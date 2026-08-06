import type { CellarHoldingContract as CellarHoldingContractShape } from "../cellar.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";
import { WineContract } from "../../catalog/test-doubles/index.js";
import { CellarEntryContract } from "./CellarEntryContractStub.js";
import { CellarFirstMetContract } from "./CellarRouteProjectionContractStub.js";


/**
 * One holding as a client receives it: the member's facts plus the wine.
 *
 * Built from the two published stubs it composes rather than restating either,
 * so a change to `WineContract` or `CellarEntryContract` reaches this one too.
 */
export const CellarHoldingContract = {
  StubFactory: {
    make(overrides: Overrides<CellarHoldingContractShape> = {}): CellarHoldingContractShape {
      return {
        entry: CellarEntryContract.StubFactory.make(),
        wine: WineContract.StubFactory.make(),
        ...overrides
      };
    },

    /**
     * A holding whose wine has left the catalogue.
     *
     * The case consumers get wrong: the bottles and what was paid for them are
     * still the member's, so this must render rather than be filtered out.
     */
    makeDelisted(overrides: Overrides<CellarHoldingContractShape> = {}): CellarHoldingContractShape {
      return CellarHoldingContract.StubFactory.make({ wine: null, ...overrides });
    },

    /**
     * A bottle whose owner first met it on a route.
     *
     * The base has no `firstMet`, and that is deliberate: most of a cellar was bought
     * on recommendation, sent by a friend or inherited, so absent is the majority
     * case and a consumer that draws an empty provenance line would draw it under
     * almost every bottle.
     *
     * What this double asserts is that the route did NOT put the bottle here. The
     * entry still carries its own `bottles`, `paidPrice` and `acquiredAt` — the
     * member bought it on the way home. `firstMet` is provenance beside possession,
     * never instead of it, and a consumer that renders this row without a bottle
     * count has read a projection into a holding.
     */
    makeFirstMetOnRoute(overrides: Overrides<CellarHoldingContractShape> = {}): CellarHoldingContractShape {
      return CellarHoldingContract.StubFactory.make({
        entry: CellarEntryContract.StubFactory.make({
          wineId: "grande-provence-amphora-chenin-2021",
          bottles: 2,
          acquiredAt: "2026-07-18T00:00:00.000Z",
          note: "Bought at the cellar door after the tasting.",
          noteLanguage: "en"
        }),
        firstMet: CellarFirstMetContract.StubFactory.make(),
        ...overrides
      });
    }
  }
};
