import type { MeasurementUnitKey } from "./units.js";

/**
 * How text travels on the wire — the three sources a display string may have,
 * and the rule that it must always declare which.
 *
 * These types were introduced for search, but they were never a search concept:
 * the moment a wine record carries ninety fields, a register of tasting words
 * and an estate's own essay, the same three-way distinction governs all of them.
 * Left inside `search`, every other feature would have declared its own — which
 * is exactly what happened with money before it moved out of `catalog`.
 *
 * The one rule underneath all of it: **the server never sends a composed
 * sentence, a formatted number or a formatted date.** Word order, plural rules
 * and separators are the presentation edge's business. A server that sends
 * "214 readings" has hardcoded English plural rules; one that sends "14.21 %"
 * has hardcoded a decimal separator that is a comma across most of Europe.
 *
 * @see {@link ../search!SearchResultMeta} for the same rule applied to a row's
 *      meta line.
 */

/**
 * A proper noun, identical in every locale — "Meerlust Estate", "Rubicon",
 * "Alexandra Meyer", a certificate number. Sent as text because there is nothing
 * to translate and nothing to negotiate: a producer name is the same word in
 * Cape Town and in Québec. Must never be stemmed by the search index — you do
 * not want "Meerlust" reduced to a stem.
 */
export type CanonicalText = Readonly<{ source: "canonical"; text: string }>;

/**
 * A fixed enum the CLIENT renders in the member's language — a verdict word, a
 * member status, a business persona, a tasting descriptor, an aroma. The server
 * sends the key and never the word.
 *
 * This is the payoff of refusing free text for closed vocabularies: because the
 * value set is closed, it travels through the tier-1 chrome catalog and reads in
 * every locale with no translation pipeline at all. `key` is the enum value as
 * the owning contract spells it (`"Unforgettable"`, `"sommelier"`,
 * `"aroma.fynbos_smoke"`); the client owns the key→catalog-path table.
 *
 * It is also what makes a controlled vocabulary SEARCHABLE across locales: the
 * index holds the key, the member sees their own language, and browsing by
 * verdict or by aroma works everywhere without the index carrying one translated
 * word. A vocabulary sent as text can only ever be searched in the language it
 * was authored in.
 */
export type ChromeText = Readonly<{ source: "chrome"; key: string }>;

/**
 * Server-localised content: an exonym ("Bourgogne" vs "Burgundy"), curated prose
 * (a tasting's title, an estate's essay) or a member's own words. The server
 * picked the best available translation for the request's `Accept-Language` and
 * states, per field, which language it actually landed on.
 *
 * `languageTag` is what makes graceful fallback visible instead of silent: when
 * it differs from what the member asked for, the client can badge the field "not
 * yet translated" rather than presenting a fallback as a translation. That
 * matters most for the two kinds of text nobody at Kgwari wrote — an estate's
 * account of its own wine, and a member's tasting note — where quietly serving
 * English to an Afrikaans reader misrepresents whose words they are reading.
 */
export type NegotiatedText = Readonly<{
  source: "negotiated";
  text: string;
  /** BCP 47 tag of the text actually returned, e.g. "en" when "fr" was asked. */
  languageTag: string;
}>;

/** Any of the three. Prefer a narrower union wherever only some are legal. */
export type LocalizedText = CanonicalText | ChromeText | NegotiatedText;

/**
 * A quantity with its unit, kept apart so the presentation edge can format the
 * number for the locale and render the unit from its catalog.
 *
 * `14.21 %` is not a string. It is a number and a unit, and it reads "14,21 %"
 * for an Afrikaans or French member. The same goes for `4.2 t/ha`, `750 ml` and
 * `18 months`: every one of them is a formatted number with a unit glued on, and
 * every one of them is wrong in some locale the moment it ships as text.
 *
 * `unitKey` is a chrome key ("unit.percent_abv", "unit.tonnes_per_hectare"), so
 * a unit that differs by market can differ without a new contract.
 */
export type Measurement = Readonly<{
  source: "measurement";
  value: number;
  unitKey: MeasurementUnitKey;
  /**
   * Significant decimals, when the value must not be rounded away — an ABV of
   * 14.21 is a regulated figure and 14.2 is a different claim. Absent means the
   * formatter's default for the unit.
   */
  fractionDigits?: number;
}>;

/**
 * A span of years — a drink window ("2024 – 2036"), a peak window.
 *
 * Years are ORDINALS, not quantities: they must not go through a grouping number
 * formatter, which renders 2018 as "2 018" in French. Sent as two numbers so the
 * client can interpolate them as plain digits and put the range separator where
 * its locale wants it.
 */
export type YearRange = Readonly<{
  source: "yearRange";
  from: number;
  to: number;
}>;
