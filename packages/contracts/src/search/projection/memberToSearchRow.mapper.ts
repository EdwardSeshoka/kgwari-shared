import type { Mapper } from "@edwardseshoka/foundation";

import type { SearchResultContract } from "../search.js";
import { facetFor, searchRowId } from "./searchRowId.js";

/** What a PERSON row needs — deliberately far less than a member record holds. */
export type ProjectableMember = {
  id: string;
  displayName: string;
  /** A closed enum — a business persona or an earned status. */
  role?: string;
  status?: string;
  noteCount: number;
};

/**
 * A member → their PERSON row.
 *
 * **The row is deliberately thin, and that is not a styling choice.** A search
 * row is read by everyone, so a field that reaches one has effectively been
 * published — which is why this takes a narrow input rather than a whole member:
 * contact details, address and coordinates cannot leak through a shape that
 * cannot carry them.
 *
 * The eyebrow is CHROME — the one place a row's eyebrow is a key rather than a
 * word. A role is a closed set, so sending the word would hardcode English into
 * every person row in the index.
 */
export const MemberToSearchRowMapper: Mapper<ProjectableMember, SearchResultContract> = {
  map(member) {
    return {
      success: true,
      data: {
        id: searchRowId("PERSON", member.id),
        kind: "PERSON",
        facet: facetFor("PERSON"),
        entityId: member.id,
        title: { source: "canonical", text: member.displayName },
        eyebrow: { source: "chrome", key: member.role ?? member.status ?? "enthusiast" },
        meta: { kind: "noteCount", count: member.noteCount }
      }
    };
  }
};
