import { Validator } from "./Validator.js";
import type { ValidationResult } from "./Validator.js";

/**
 * Turning what a member TYPED into the canonical integer a contract stores.
 *
 * Money is stored as an integer count of minor units — 89500, not 895.00 — but
 * nobody types minor units. A member types `895,50` in Johannesburg, `1 234,56`
 * in Paris and `1,234.56` in London, all meaning amounts a `MoneyContract` has
 * to hold exactly. This module is that boundary, and it is the mirror image of
 * `formatCurrency`: format goes canonical → words, this goes words → canonical.
 *
 * **Two decisions shape everything here.**
 *
 * *It does no locale detection.* Separators and the currency's decimal exponent
 * are ARGUMENTS, not something this module looks up. `Intl` lives at the
 * presentation edge; foundation is imported by domain and backend code that must
 * not depend on it. The caller derives the separators once (see
 * `separatorsForLocale` in the localization package) and passes them in — which
 * also makes every case here testable without a locale.
 *
 * *It never touches floating point.* The obvious implementation,
 * `parseFloat(text) * 100`, is wrong in a way that only shows up in production
 * data: `19.99 * 100` is `1998.9999999999998`, and `Math.round` merely hides
 * that the approach is unsound. The parse below works on the DIGIT STRING —
 * split at the decimal separator, pad the fraction to the currency's exponent,
 * concatenate, read as an integer. No value ever becomes a float, so no value
 * is ever approximated.
 */

/** What the member's formatting locale uses to punctuate a number. */
export type NumberSeparators = {
  /** Between the whole part and the fraction — `,` in fr/af, `.` in en. */
  decimal: string;
  /**
   * Between thousands. Often a space — and in French locales that space is
   * usually U+202F (narrow no-break) or U+00A0, NOT an ASCII space. Stripping
   * only `" "` is a real and common bug, so every Unicode space is stripped.
   */
  group: string;
};

export type MoneyAmountIssueCode =
  | "empty"
  | "notANumber"
  | "multipleDecimalSeparators"
  | "tooManyDecimalPlaces"
  | "negativeNotAllowed"
  | "tooLarge";

export type ParseMoneyAmountOptions = {
  separators: NumberSeparators;
  /**
   * How many decimal places this currency has: 2 for EUR/ZAR, 0 for JPY, 3 for
   * BHD. Derived by the caller from the currency code — never stored on a
   * contract, never guessed as 2.
   */
  exponent: number;
  /** Prices are positive. Defaults to false. */
  allowNegative?: boolean;
};

/** Every Unicode space, including the narrow no-break space French grouping uses. */
const ANY_SPACE = /[\s    ]/gu;

/**
 * Non-Latin digits → Latin. Applied here as well as at the search boundary,
 * because a member using an Arabic-Indic keyboard types prices too.
 */
const DIGIT_FOLDING: ReadonlyArray<readonly [RegExp, number]> = [
  [/[٠-٩]/gu, 0x0660], // Arabic-Indic
  [/[۰-۹]/gu, 0x06f0], // Extended Arabic-Indic
  [/[०-९]/gu, 0x0966], // Devanagari
];

function foldDigits(value: string): string {
  return DIGIT_FOLDING.reduce(
    (text, [pattern, base]) =>
      text.replace(pattern, (digit) => String(digit.codePointAt(0)! - base)),
    value
  );
}

function issue(
  code: MoneyAmountIssueCode,
  message: string
): ValidationResult<number, MoneyAmountIssueCode> {
  return Validator.invalid(Validator.issue(code, message));
}

/**
 * Parse typed text into an integer number of minor units.
 *
 * Accepts what members actually type: a currency symbol or code, spaces, group
 * separators, a leading minus. Rejects anything ambiguous rather than guessing —
 * a wrong amount that looks plausible is worse than a rejected one.
 *
 * @example
 * ```ts
 * parseMoneyAmount("R 895,50", { separators: { decimal: ",", group: " " }, exponent: 2 })
 * // → success(89550)
 *
 * parseMoneyAmount("1 234,56", { separators: { decimal: ",", group: " " }, exponent: 2 })
 * // → success(123456)
 *
 * parseMoneyAmount("1250.5", { separators: { decimal: ".", group: "," }, exponent: 0 })
 * // → failure "tooManyDecimalPlaces" — JPY has no minor unit
 * ```
 */
export function parseMoneyAmount(
  input: string,
  { separators, exponent, allowNegative = false }: ParseMoneyAmountOptions
): ValidationResult<number, MoneyAmountIssueCode> {
  const folded = foldDigits(input ?? "");

  // Strip everything that is presentation: symbols, codes, spaces, group marks.
  // Done before anything is interpreted, so "R 1 234,56" and "1234,56" take the
  // same path.
  let text = folded.replace(ANY_SPACE, "");
  if (separators.group) text = text.split(separators.group).join("");
  text = text.replace(/[^\d\-+.,'·’]/gu, "");

  let negative = false;
  if (text.startsWith("-")) {
    negative = true;
    text = text.slice(1);
  } else if (text.startsWith("+")) {
    text = text.slice(1);
  }

  if (text === "") return issue("empty", "No amount was entered.");

  // Only the locale's own decimal separator counts. Any OTHER separator still
  // present is a leftover group mark the caller did not declare — drop it rather
  // than fail, since "1,234.56" parsed as en is unambiguous once "." is known.
  const decimal = separators.decimal;
  const parts = text.split(decimal);
  if (parts.length > 2) {
    return issue(
      "multipleDecimalSeparators",
      `"${input}" has more than one "${decimal}".`
    );
  }

  const whole = (parts[0] ?? "").replace(/[.,'·’]/gu, "");
  const fraction = parts[1] ?? "";

  if (!/^\d*$/u.test(whole) || !/^\d*$/u.test(fraction)) {
    return issue("notANumber", `"${input}" is not a number.`);
  }
  if (whole === "" && fraction === "") {
    return issue("empty", "No amount was entered.");
  }
  if (fraction.length > exponent) {
    return issue(
      "tooManyDecimalPlaces",
      exponent === 0
        ? `This currency has no minor unit, so "${input}" cannot have decimals.`
        : `This currency has ${exponent} decimal places; "${input}" has ${fraction.length}.`
    );
  }
  if (negative && !allowNegative) {
    return issue("negativeNotAllowed", "The amount cannot be negative.");
  }

  // The whole point: concatenate digits, never multiply a float.
  const digits = `${whole || "0"}${fraction.padEnd(exponent, "0")}`;
  const minorUnits = Number(digits);

  if (!Number.isSafeInteger(minorUnits)) {
    return issue("tooLarge", `"${input}" is too large to represent exactly.`);
  }

  return Validator.valid(negative ? -minorUnits : minorUnits);
}

/**
 * Minor units → the plain decimal string an EDIT FIELD should hold.
 *
 * Deliberately not a formatted amount: an input a member is about to edit must
 * not contain a currency symbol or group separators, or their next keystroke
 * fights the formatter. Use `formatCurrency` for display and this for editing.
 *
 * @example `toEditableAmount(89550, 2, ",")` → `"895,50"`
 */
export function toEditableAmount(
  minorUnits: number,
  exponent: number,
  decimalSeparator: string
): string {
  const negative = minorUnits < 0;
  const digits = String(Math.abs(minorUnits)).padStart(exponent + 1, "0");
  const whole = digits.slice(0, digits.length - exponent);
  const fraction = exponent === 0 ? "" : digits.slice(digits.length - exponent);
  const body = exponent === 0 ? whole : `${whole}${decimalSeparator}${fraction}`;
  return negative ? `-${body}` : body;
}

/**
 * The same rule as a {@link Validator}, bound to one currency and locale.
 *
 * Use this at a form boundary, where the rest of the codebase already speaks
 * `Validator` — it composes with `Validator.accepts` for enabling a save button
 * and with `Validator.describe` for logging, and it reports issue codes the
 * presentation layer can map to its own localized copy.
 *
 * @example
 * ```ts
 * const validator = MoneyAmountValidator({ separators, exponent });
 * const result = validator.validate(typed);
 * if (!result.success) return showFieldError(result.error);
 * save({ amountMinorUnits: result.data, currency });
 * ```
 */
export function MoneyAmountValidator(
  options: ParseMoneyAmountOptions
): Validator<string, number, MoneyAmountIssueCode> {
  return { validate: (input: string) => parseMoneyAmount(input, options) };
}
