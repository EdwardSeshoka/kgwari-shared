/**
 * The published specs — one definition of "correct" shared by both composers.
 *
 * Deliberately NOT re-exported from the package root. A spec is opt-in: a consumer
 * reaches for `@edwardseshoka/contracts/spec` when it wants its build held to these
 * rules, and an app that only renders contracts should not pull assertion code into
 * its bundle by importing the root.
 */
export * from "./routeAgreement.js";
