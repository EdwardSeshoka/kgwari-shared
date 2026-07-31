/**
 * Social's sample data — the only entry point a consumer of it needs.
 *
 * Mirrors the per-feature subpaths `@edwardseshoka/contracts` already offers, so
 * a feature can import the seeds for ITS domain and reach no other. Before this,
 * samples had a single root export: importing one wine pulled every domain's
 * fixtures in behind it, and nothing stopped a catalog module quietly depending
 * on a social one.
 */
export { socialSamples } from "./socialSamples.js";
