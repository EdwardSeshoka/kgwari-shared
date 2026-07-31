import type { ProjectableRegion as ProjectableRegionShape } from "../projection/index.js";

/** Overrides that may explicitly REMOVE a field — `Partial<T>` cannot, under
 * `exactOptionalPropertyTypes`, and removing is what the interesting tests do. */
type Overrides = { [K in keyof ProjectableRegionShape]?: ProjectableRegionShape[K] | undefined };

export const ProjectableRegion = {
  StubFactory: {
    make(overrides: Overrides = {}): ProjectableRegionShape {
      return {
        id: "region_stellenbosch",
        name: "Stellenbosch",
        country: "South Africa",
        parentRegion: "Coastal Region",
        wineCount: 1299,
        ...overrides
      } as ProjectableRegionShape;
    },

    /**
     * A place whose name differs by language — Bourgogne / Burgundy. Its title
     * travels as NEGOTIATED, carrying the language actually served.
     */
    makeExonymous(overrides: Overrides = {}): ProjectableRegionShape {
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
