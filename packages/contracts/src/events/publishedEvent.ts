import type { EventContract } from "./event.js";

/**
 * An evening a stranger can be shown.
 *
 * ## Why this is a type and not a runtime check
 *
 * The same move {@link ../collections!PublishedCollectionContract} makes, for the
 * same reason: a rule a server has to remember is a rule that holds until the
 * day somebody adds a third feed. A private evening reaching Discover would put
 * a member's address in front of strangers, which is the one failure here worth
 * making unrepresentable rather than merely forbidden.
 *
 * So every surface that faces an audience — the Discover chapter, the calendar
 * landing, the ledger's attendance rows — takes THIS type, and a producer cannot
 * construct one from a private event without saying so in a cast that a reviewer
 * would see.
 *
 * It does not encode WHO published it. That is
 * {@link ../trust!canPublishEvents}, checked once at the write boundary, because
 * a host's standing can change after the fact and an evening already published
 * does not retroactively un-publish itself.
 */
export type PublishedEventContract = EventContract & {
  visibility?: "published";
};
