import type { NegotiatedText } from "../text/index.js";
import type { EditorialClaimAnswerContract } from "./claimAnswer.js";

/**
 * How the writer came by a claim.
 *
 * Per ROW, not per piece, because one piece mixes them: a writer who stood in
 * the cellar for two of these facts and was told the third over email has three
 * claims of two different weights, and a single byline-level "sourced" flattens
 * that into a promise the piece cannot keep.
 *
 *  - `firsthand` The writer saw, tasted or measured it themselves.
 *  - `panel`     Said on the record by somebody on the panel, at the event.
 *  - `reported`  Supplied by the estate or another party and not independently
 *                checked. The honest label for most of what an estate publishes.
 *
 * There is NO count anywhere in this module. "Sourced from 14 claims" is a
 * number that invites optimisation, and a piece that pads its sources column to
 * look better-reported has defeated the column.
 */
export type EditorialClaimSource = "firsthand" | "panel" | "reported";

/**
 * One checkable statement the piece makes, with where it came from.
 *
 * Structured rather than left as prose for one reason: a piece whose facts are
 * only prose is a piece the wine record cannot cite. See
 * {@link EditorialClaimAnswerContract}.
 */
export type EditorialClaimContract = {
  id: string;
  /** The claim as written. Prose, so it carries the language it was written in. */
  body: NegotiatedText;
  source: EditorialClaimSource;
  /** Record rows this claim answers. Absent when it answers none — most do not. */
  answers?: EditorialClaimAnswerContract[];
};
