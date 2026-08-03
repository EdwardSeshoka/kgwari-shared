export * from "./wine.js";
export * from "./record.js";
export * from "./register.js";
export * from "./availability.js";
export * from "./verification.js";
export * from "./requests.js";
export * from "./collections.js";
export * from "./pricing.js";
/**
 * The closed vocabularies moved OUT of catalog in 7.0 and are re-exported here.
 *
 * They were never catalogue concepts. A tasting scale, an aroma key and a colour
 * reading are answered on a member's NOTE and aggregated into a wine's register,
 * so the note-writing surface needs exactly the vocabulary the record serves —
 * that identity is the whole search story (the index holds `aroma.fynbosSmoke`
 * and every locale browses it). Living inside `catalog`, they were unreachable
 * from `social` without one feature importing a peer, which is the boundary this
 * package asserts rather than remembers.
 *
 * They now sit at layer 1 beside `trust` and `money`, where the layer map always
 * said the vocabularies belonged. This re-export is not deprecated — a record's
 * own keys still read naturally from `@edwardseshoka/contracts/catalog`;
 * `@edwardseshoka/contracts/vocabulary` is the new direct entrance.
 */
export * from "../vocabulary/index.js";
