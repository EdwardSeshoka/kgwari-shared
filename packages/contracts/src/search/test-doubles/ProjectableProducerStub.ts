import type { ProjectableProducer as ProjectableProducerShape } from "../projection/index.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

export const ProjectableProducer = {
  StubFactory: {
    ...defineStub<ProjectableProducerShape>({
        id: "estate_meerlust",
        name: "Meerlust Estate",
        regionName: "Stellenbosch",
        foundedYear: 1693,
        wineCount: 18}),

    /** Producers rarely record a founding year, so the meta line must cope. */
    makeUndated(overrides: Overrides<ProjectableProducerShape> = {}): ProjectableProducerShape {
      return ProjectableProducer.StubFactory.make({ foundedYear: undefined, ...overrides });
    }
  }
};
