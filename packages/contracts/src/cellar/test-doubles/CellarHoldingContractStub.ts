import type { CellarHoldingContract as CellarHoldingContractShape } from "../cellar.js";
import { WineContract } from "../../catalog/test-doubles/index.js";
import { CellarEntryContract } from "./CellarEntryContractStub.js";

type Overrides = {
  [K in keyof CellarHoldingContractShape]?: CellarHoldingContractShape[K] | undefined;
};

/**
 * One holding as a client receives it: the member's facts plus the wine.
 *
 * Built from the two published stubs it composes rather than restating either,
 * so a change to `WineContract` or `CellarEntryContract` reaches this one too.
 */
export const CellarHoldingContract = {
  StubFactory: {
    make(overrides: Overrides = {}): CellarHoldingContractShape {
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
    makeDelisted(overrides: Overrides = {}): CellarHoldingContractShape {
      return CellarHoldingContract.StubFactory.make({ wine: null, ...overrides });
    }
  }
};
