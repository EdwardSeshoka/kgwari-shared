import type { ProjectableProducer as ProjectableProducerShape } from "../projection/index.js";

/** Overrides that may explicitly REMOVE a field — `Partial<T>` cannot, under
 * `exactOptionalPropertyTypes`, and removing is what the interesting tests do. */
type Overrides = { [K in keyof ProjectableProducerShape]?: ProjectableProducerShape[K] | undefined };

export const ProjectableProducer = {
  StubFactory: {
    make(overrides: Overrides = {}): ProjectableProducerShape {
      return {
        id: "estate_meerlust",
        name: "Meerlust Estate",
        regionName: "Stellenbosch",
        foundedYear: 1693,
        wineCount: 18,
        ...overrides
      } as ProjectableProducerShape;
    },

    /** Producers rarely record a founding year, so the meta line must cope. */
    makeUndated(overrides: Overrides = {}): ProjectableProducerShape {
      return ProjectableProducer.StubFactory.make({ foundedYear: undefined, ...overrides });
    }
  }
};
