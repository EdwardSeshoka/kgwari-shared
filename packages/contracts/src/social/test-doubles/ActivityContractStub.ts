import type { ActivityContract as ActivityContractShape } from "../activity.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * One thing that happened in the room — a check-in, a review, a tasting note.
 *
 * `verdict` is a WORD from the locked set, never a numeric score, and the wine
 * reference carries `vintage` as a number so a reader renders the year as plain
 * digits rather than receiving "2019" already decided.
 */

export const ActivityContract = {
  StubFactory: {
    ...defineStub<ActivityContractShape>({
        id: "activity_check-in_1",
        activityType: "check_in",
        user: { id: "user_thandi-mokoena", displayName: "Thandi Mokoena", initials: "TM" },
        wine: {
          id: "wine_kanonkop-pinotage-2019",
          name: "Pinotage",
          producerName: "Kanonkop Estate",
          vintage: 2019
        },
        verdict: "Essential",
        createdAt: "2026-06-23T10:15:30.000Z"}),

    /** A review with words attached, by a member carrying a professional tier. */
    makeReview(overrides: Overrides<ActivityContractShape> = {}): ActivityContractShape {
      return ActivityContract.StubFactory.make({
        id: "activity_review_1",
        activityType: "review",
        user: {
          id: "user_alexandra-meyer",
          displayName: "Alexandra Meyer",
          initials: "AM",
          tier: "professional",
          role: "Sommelier"
        },
        note: "Still singing after three hours in the decanter.",
        ...overrides
      });
    }
  }
};
