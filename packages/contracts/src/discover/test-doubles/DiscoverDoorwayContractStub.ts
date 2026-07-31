import type { DiscoverDoorwayContract as DiscoverDoorwayContractShape } from "../doorway.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * A way in — a region, a producer, a curated set — as one merged browse card.
 *
 * `target` is a discriminated union rather than a `kind` beside a loose id, so a
 * doorway cannot claim to be a region while carrying a producer's identifier.
 */

export const DiscoverDoorwayContract = {
  StubFactory: {
    ...defineStub<DiscoverDoorwayContractShape>({
        id: "doorway_stellenbosch",
        kind: "region",
        title: "Stellenbosch",
        subtitle: "The Cape's oldest wine district",
        wineCount: 1299,
        target: { kind: "region", regionId: "region_stellenbosch" }}),

    /** A curated collection, which is the one kind with a human curator behind it. */
    makeCollection(overrides: Overrides<DiscoverDoorwayContractShape> = {}): DiscoverDoorwayContractShape {
      return DiscoverDoorwayContract.StubFactory.make({
        id: "doorway_worth-opening-now",
        kind: "collection",
        title: "Worth opening now",
        curator: { name: "Alexandra Meyer", tier: "professional", role: "Sommelier" },
        target: { kind: "collection", collectionId: "worth_opening_now" },
        ...overrides
      });
    }
  }
};
