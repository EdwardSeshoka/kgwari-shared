import type { ProjectableWine as ProjectableWineShape } from "../projection/index.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * The eight fields a WINE row is allowed to read.
 *
 * Deliberately smaller than `WineContract`: a projection's input type is its
 * audit, and these are exactly the fields that can reach a row everyone can see.
 */

export const ProjectableWine = {
  StubFactory: {
    ...defineStub<ProjectableWineShape>({
        id: "rubicon-2018",
        name: "Rubicon",
        estate: "Meerlust Estate",
        vintage: 2018,
        verdict: "Essential",
        price: { amountMinorUnits: 89500, currency: "ZAR" },
        imageUrl: "https://images.example.com/rubicon-2018.jpg"}),

    /** Blended across years by design — a statement about the WINE. */
    makeNonVintage(overrides: Overrides<ProjectableWineShape> = {}): ProjectableWineShape {
      return ProjectableWine.StubFactory.make({
        id: "brut-reserve-nv",
        name: "Brut Réserve",
        vintage: undefined,
        vintageDisplay: "NV",
        ...overrides
      });
    },

    /** No year and no marker — a statement about the RECORD, not the wine. */
    makeVintageUnknown(overrides: Overrides<ProjectableWineShape> = {}): ProjectableWineShape {
      return ProjectableWine.StubFactory.make({
        vintage: undefined,
        vintageDisplay: undefined,
        ...overrides
      });
    },

    /** Most of the catalogue is not for sale. */
    makeUnlisted(overrides: Overrides<ProjectableWineShape> = {}): ProjectableWineShape {
      return ProjectableWine.StubFactory.make({ price: undefined, ...overrides });
    }
  }
};
