import type { ProjectableMember as ProjectableMemberShape } from "../projection/index.js";
import { defineStub, type Overrides } from "../../test-doubles/index.js";

/**
 * The five fields a PERSON row may read.
 *
 * The narrowest input in the projection folder, and deliberately so: a member
 * record carries an email, an address and coordinates, and a search row is read
 * by everyone. Their leaking is not something to be careful about — it is
 * something this shape cannot express.
 */

export const ProjectableMember = {
  StubFactory: {
    ...defineStub<ProjectableMemberShape>({
        id: "user_alexandra-meyer",
        displayName: "Alexandra Meyer",
        status: "enthusiast",
        noteCount: 241}),

    /** A business persona rather than an earned status — both render as chrome. */
    makeProfessional(overrides: Overrides<ProjectableMemberShape> = {}): ProjectableMemberShape {
      return ProjectableMember.StubFactory.make({
        id: "user_thabo-nkosi",
        displayName: "Thabo Nkosi",
        status: undefined,
        role: "sommelier",
        ...overrides
      });
    }
  }
};
