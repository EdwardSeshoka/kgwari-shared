import type { ProjectableEvent as ProjectableEventShape } from "../projection/index.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

export const ProjectableEvent = {
  StubFactory: {
    ...defineStub<ProjectableEventShape>({
        id: "event_meerlust_cellar_tasting",
        title: "Meerlust cellar tasting",
        titleLanguage: "en",
        venueName: "Meerlust Estate",
        startDateTime: "2026-07-24T16:00:00.000Z",
        seatsAvailable: 4}),

    /** ABSENT seats means UNCAPPED, not unknown — never render "0 seats left". */
    makeUncapped(overrides: Overrides<ProjectableEventShape> = {}): ProjectableEventShape {
      return ProjectableEvent.StubFactory.make({ seatsAvailable: undefined, ...overrides });
    },

    /** No start time — the tasting meta needs one, so the row carries no meta. */
    makeUndated(overrides: Overrides<ProjectableEventShape> = {}): ProjectableEventShape {
      return ProjectableEvent.StubFactory.make({ startDateTime: undefined, ...overrides });
    }
  }
};
