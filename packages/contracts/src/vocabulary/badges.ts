/**
 * Badges a collection can wear.
 *
 * Separate from the collection key because not every collection has one, and
 * which does is a presentation decision that should not require inventing a new
 * collection to express.
 */
export const COLLECTION_BADGES = ["badge.featured", "badge.new", "badge.lastBottles"] as const;

export type CollectionBadgeKey = (typeof COLLECTION_BADGES)[number];
