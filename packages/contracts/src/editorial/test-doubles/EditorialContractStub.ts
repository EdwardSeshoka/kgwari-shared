import type { EditorialContract as EditorialContractShape } from "../editorial.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * A piece of editorial.
 *
 * `subject` is what the piece is ABOUT, as a discriminated union rather than a
 * loose id — it powers cross-linking, and a bare `wineId` could not say whether
 * it meant the label or one harvest of it.
 */

export const EditorialContract = {
  StubFactory: {
    ...defineStub<EditorialContractShape>({
        id: "editorial_rubicon-once-more",
        contentType: "article",
        title: "Rubicon, once more.",
        categoryLabel: "This week",
        description:
          "Four Bordeaux varieties, pouring generously after three hours in the decanter.",
        author: { name: "Alexandra Meyer", tier: "professional", role: "Sommelier" },
        subject: { kind: "wine", wineVintageId: "wine_rubicon-2018" }}),

    /**
     * A vintage report — the one subject variant that is about a YEAR rather than
     * an entity, and so carries no id to link to.
     */
    makeVintageReport(overrides: Overrides<EditorialContractShape> = {}): EditorialContractShape {
      return EditorialContract.StubFactory.make({
        id: "editorial_2018-in-stellenbosch",
        contentType: "guide",
        title: "2018 in Stellenbosch",
        subject: { kind: "vintage_report", regionId: "region_stellenbosch", vintage: 2018 },
        ...overrides
      });
    }
  }
};
