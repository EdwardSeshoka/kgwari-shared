/**
 * The cellar's sample data — the only entry point a consumer of it needs.
 *
 * Mirrors the per-feature subpaths `@edwardseshoka/contracts` already offers, so a
 * feature can import the seeds for ITS domain and reach no other.
 */
export { cellarSamples, createCellar, createCellarIndex } from "./cellarSamples.js";
