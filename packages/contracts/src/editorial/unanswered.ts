import type { NegotiatedText } from "../text/index.js";

/**
 * What the piece asked and did not get.
 *
 * The column that makes the sources column honest. A piece that prints only what
 * it learned reads as complete; printing the questions that went unanswered is
 * what tells a reader where the account stops.
 */
export type EditorialUnansweredContract = {
  question: NegotiatedText;
  /**
   * Why there is no answer. **Never null**, and the three are different facts a
   * null cannot tell apart:
   *
   *  - `declined`   Asked, and the estate said no. A recorded refusal.
   *  - `no_reply`   Asked, and nothing came back. Not the same as a refusal —
   *                 one is a position, the other is silence.
   *  - `not_sought` Never asked. The most honest of the three and the one a null
   *                 used to disguise as either of the others.
   */
  answer: "declined" | "no_reply" | "not_sought";
};
