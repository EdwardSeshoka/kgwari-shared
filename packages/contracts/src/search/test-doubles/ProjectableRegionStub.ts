import type { ProjectableRegion as ProjectableRegionShape } from "../projection/index.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

export const ProjectableRegion = {
  StubFactory: {
    ...defineStub<ProjectableRegionShape>({
        id: "region_stellenbosch",
        name: "Stellenbosch",
        country: "South Africa",
        parentRegion: "Coastal Region",
        wineCount: 1299}),

    /**
     * A place whose name differs by language — Bourgogne / Burgundy. Its title
     * travels as NEGOTIATED, carrying the language actually served.
     */
    makeExonymous(overrides: Overrides<ProjectableRegionShape> = {}): ProjectableRegionShape {
      return ProjectableRegion.StubFactory.make({
        id: "region_bourgogne",
        name: "Bourgogne",
        country: "France",
        parentRegion: undefined,
        exonym: true,
        nameLanguage: "fr",
        ...overrides
      });
    }
  }
};
