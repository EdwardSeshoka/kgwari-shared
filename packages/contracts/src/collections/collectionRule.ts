import type { LocalizedText, Measurement, YearRange } from "../text/index.js";

/**
 * A Lens's rule — what the thing actually selects, in a form a client can read
 * aloud in its own language.
 *
 * ## Why a Lens needs this and no other kind does
 *
 * The other three kinds are enumerated: somebody put each item in, so the list IS
 * its own explanation and a row showing its title and count has said everything
 * there is. A Lens is DERIVED — its contents are whatever the rule returns right
 * now — so a row that shows only "Ready this year · 14" has told a member the
 * answer and withheld the question. The cellar index is where that bites, because
 * it is the one surface that shows lenses at all: a member's own index is shelves,
 * her own rules, and what she follows.
 *
 * ## Not `description`, and the difference is not stylistic
 *
 * {@link CollectionContract.description} is optional prose ABOUT a list — "Three
 * cellar doors, one long lunch, and one designated driver". A rule is the lens's
 * DEFINITION: change it and the contents change. Folding one into the other leaves
 * the row unable to say which it is showing, and a shelf's sub-line and a lens's
 * sub-line stop meaning the same kind of thing.
 *
 * ## Why this is not a sentence
 *
 * The obvious shape is `rule?: string` carrying "Drinking window includes 2026",
 * and it is wrong here for the reason this package states in
 * {@link ../text!CanonicalText}'s own preamble: **the server never sends a composed
 * sentence or a formatted number.** That string hardcodes English word order, and
 * "2026" run through a grouping formatter reads "2 026" in French — the exact
 * fault a vintage already produced once on the wine record.
 *
 * So the predicate travels as a key and its operands travel as carriers, and the
 * render edge composes. That is the same split {@link ../catalog!RecordFieldValue}
 * makes for a record's ninety fields, and it is what lets a lens read in a locale
 * nobody has translated a rule into.
 */
export type CollectionRuleContract = {
  /**
   * Chrome key for the predicate — `"lensRule.drinkingWindowIncludes"`,
   * `"lensRule.regionIs"`.
   *
   * **NOT a closed union, and deliberately** — the identical call
   * {@link ../catalog!RegisterChoiceMetricContract} makes, for the identical
   * reason. Nothing has produced a member-built lens yet. Closing the set now
   * would mean inventing one from imagination, and an invented vocabulary is worse
   * than an open string because it looks authoritative: a client would build a
   * switch over six predicates that no member ever writes and no server ever
   * sends.
   *
   * Close it the day real lenses exist and the set can be read off them rather
   * than guessed at. That is a MAJOR when it happens, and it should be.
   */
  key: string;
  /**
   * What the predicate is about, in the order its phrasing takes them.
   *
   * Positional rather than named, because the catalogue entry for `key` owns the
   * word order and a locale may need the operands in a different one — which is
   * precisely what interpolation by position lets a translator do and a named bag
   * does not. A predicate that takes none omits this rather than sending `[]`.
   *
   * ## Money is deliberately not expressible here yet
   *
   * "Paid under R300" is an obvious lens and it cannot be written with this union,
   * which is a real gap and is named rather than worked around. Every member of the
   * union declares its source; {@link ../money!MoneyContract} does not — it is a
   * pair of fields with no carrier, because until now money has only ever appeared
   * in a field typed as money. Giving it one is a change to `text/`, where the
   * carriers live and where a seventh source has to be argued for against the other
   * six. It is not a decision the collections domain gets to make on the way past.
   */
  operands?: readonly CollectionRuleOperand[];
};

/**
 * What a rule can be about.
 *
 * Every member carries a `source`, so a render edge switches on one field to know
 * whether it is holding a proper noun to print as-is, a key to look up, a number
 * to format for the locale, or a span of ordinals that must never see a grouping
 * separator.
 *
 * ## A single year is a `Measurement`, not a one-wide `YearRange`
 *
 * "Drinking window includes 2026" takes ONE year, and {@link YearRange} is a span —
 * `{ from: 2026, to: 2026 }` would be a lie about the shape of the fact. The year
 * rides {@link Measurement} with `unit.vintageYear`, which is the carrier a vintage
 * already uses and which the render edge already knows to print as bare digits with
 * no unit word after them. That special case exists because a year run through a
 * grouping formatter reads "2 026" in French — a bug this catalogue has shipped
 * once already, on a wine record's vintage, and fixed in exactly this way.
 */
export type CollectionRuleOperand = LocalizedText | Measurement | YearRange;
