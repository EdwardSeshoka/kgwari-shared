import type { ProjectableEvent as ProjectableEventShape } from "../projection/index.js";

/** Overrides that may explicitly REMOVE a field — `Partial<T>` cannot, under
 * `exactOptionalPropertyTypes`, and removing is what the interesting tests do. */
type Overrides = { [K in keyof ProjectableEventShape]?: ProjectableEventShape[K] | undefined };

export const ProjectableEvent = {
  StubFactory: {
    make(overrides: Overrides = {}): ProjectableEventShape {
      return {
        id: "event_meerlust_cellar_tasting",
        title: "Meerlust cellar tasting",
        titleLanguage: "en",
        venueName: "Meerlust Estate",
        startDateTime: "2026-07-24T16:00:00.000Z",
        seatsAvailable: 4,
        ...overrides
      } as ProjectableEventShape;
    },

    /** ABSENT seats means UNCAPPED, not unknown — never render "0 seats left". */
    makeUncapped(overrides: Overrides = {}): ProjectableEventShape {
      return ProjectableEvent.StubFactory.make({ seatsAvailable: undefined, ...overrides });
    },

    /** No start time — the tasting meta needs one, so the row carries no meta. */
    makeUndated(overrides: Overrides = {}): ProjectableEventShape {
      return ProjectableEvent.StubFactory.make({ startDateTime: undefined, ...overrides });
    }
  }
};
