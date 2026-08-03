import type { TastingNoteContract } from "../social/index.js";
import type { DiscoverFeature } from "./feature.js";

/**
 * A member's note, at the top of the page — "From the room".
 *
 * The Masthead's own lede, and the one that makes the page sound like the room
 * rather than like Kgwari: the front page opens in a member's exact words, under
 * their name, about a bottle they actually drank.
 *
 * {@link TastingNoteContract} is the right carrier rather than
 * {@link ../social!ActivityContract} — it already holds `saveCount` (which is
 * how a note gets chosen to lead at all) and the wine ref, and it is the durable
 * record rather than a feed line that scrolls away.
 */
export type DiscoverNoteHeroContract = {
  kind: "note";
  feature?: DiscoverFeature;
  note: TastingNoteContract;
};
