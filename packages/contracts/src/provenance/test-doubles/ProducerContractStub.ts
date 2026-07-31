import type { ProducerContract as ProducerContractShape } from "../producer.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * A wine producer.
 *
 * `foundedYear` is an ordinal, not a quantity: it must reach the screen as plain
 * digits, because a grouping formatter renders 1693 as "1 693" in French. Only
 * `wineCount` is grouped.
 */

export const ProducerContract = {
  StubFactory: {
    ...defineStub<ProducerContractShape>({
        id: "producer_meerlust",
        name: "Meerlust Estate",
        countryCode: "ZA",
        regionId: "region_stellenbosch",
        regionName: "Stellenbosch",
        foundedYear: 1693,
        wineCount: 6}),

    /** A producer with no founding year on record — absent, not zero. */
    makeUndated(overrides: Overrides<ProducerContractShape> = {}): ProducerContractShape {
      return ProducerContract.StubFactory.make({
        id: "producer_new",
        name: "Silwervis",
        foundedYear: undefined,
        ...overrides
      });
    }
  }
};
