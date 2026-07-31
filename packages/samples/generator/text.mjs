/**
 * The three text carriers, as constructors.
 *
 * Trivial, and deliberately shared rather than redefined per stage: they are the
 * one place a generated row declares HOW a string should be rendered, and a
 * stage that quietly built `{ text }` without a `source` would emit a row no
 * client knows how to read.
 */
export const canonical = (text) => ({ source: "canonical", text });
export const negotiated = (text, languageTag) => ({ source: "negotiated", text, languageTag });
export const chrome = (key) => ({ source: "chrome", key });
