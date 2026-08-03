import type { ColourReadingContract as ColourReadingContractShape } from "../register.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * Colour as record metadata — a reading with a swatch as evidence.
 *
 * It carries `readingCount` so it never reads as a verdict: colour is what
 * members observed, and how many observed it is part of the claim.
 *
 * The hex values are the one piece of presentation data that legitimately
 * belongs to the wine rather than to the client — they are what THIS bottle
 * looked like, not how a palette renders. `makeWithoutSwatch()` is the case a
 * client that always draws a gradient gets wrong: a reading can exist without
 * anybody having sampled a colour off a photograph.
 */
export const ColourReadingContract = {
  StubFactory: {
    ...defineStub<ColourReadingContractShape>({
      readingKey: "colour.deepGarnet",
      readingCount: 214,
      coreHex: "#5B1A22",
      rimHex: "#8C3A3A"
    }),

    /** A reading with no swatch sampled — render the word, draw nothing. */
    makeWithoutSwatch(
      overrides: Overrides<ColourReadingContractShape> = {}
    ): ColourReadingContractShape {
      return ColourReadingContract.StubFactory.make({
        coreHex: undefined,
        rimHex: undefined,
        ...overrides
      });
    },

    /** A white's reading, so a consumer's fixtures are not all red. */
    makeWhite(overrides: Overrides<ColourReadingContractShape> = {}): ColourReadingContractShape {
      return ColourReadingContract.StubFactory.make({
        readingKey: "colour.paleStraw",
        readingCount: 96,
        coreHex: "#E8DFAE",
        rimHex: "#F2ECCB",
        ...overrides
      });
    }
  }
};
