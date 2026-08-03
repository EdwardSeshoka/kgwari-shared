/**
 * Every domain's samples.
 *
 * Prefer the per-feature subpath — `@edwardseshoka/samples/catalog` — so a
 * module's imports state which domains it actually depends on. This root export
 * exists for the seed script and the generator, which legitimately need all of
 * them at once.
 */
export * from "./features/catalog/index.js";
export * from "./features/collections/index.js";
export * from "./features/provenance/index.js";
export * from "./features/editorial/index.js";
export * from "./features/events/index.js";
export * from "./features/social/index.js";
export * from "./features/search/index.js";
export * from "./features/discover/index.js";
