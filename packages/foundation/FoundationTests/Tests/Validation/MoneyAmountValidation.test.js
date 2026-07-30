import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  MoneyAmountValidator,
  parseMoneyAmount,
  toEditableAmount,
} from "../../../dist/index.js";

/** en-ZA / af-ZA: comma decimal, space grouping. */
const ZA = { separators: { decimal: ",", group: " " }, exponent: 2 };
/** en-GB / en-US: dot decimal, comma grouping. */
const EN = { separators: { decimal: ".", group: "," }, exponent: 2 };
/** fr-FR: comma decimal, NARROW NO-BREAK SPACE grouping. */
const FR = { separators: { decimal: ",", group: " " }, exponent: 2 };
/** de-DE / it-IT: comma decimal, dot grouping. */
const DE = { separators: { decimal: ",", group: "." }, exponent: 2 };
/** JPY: no minor unit at all. */
const JPY = { separators: { decimal: ".", group: "," }, exponent: 0 };

describe("parseMoneyAmount", () => {
  it(
    "turns what a member types into the integer the contract stores",
    function givenAPlainAmount_whenParsed_thenItIsMinorUnits() {
      // Given / When
      const result = parseMoneyAmount("895,50", ZA);

      // Then
      assert.equal(result.success, true);
      assert.equal(result.data, 89550);
    },
  );

  it(
    "never approximates, where multiplying a float would",
    function givenAnAmountThatBreaksFloatMath_whenParsed_thenItIsExact() {
      // Given: 19.99 * 100 is 1998.9999999999998 in IEEE 754.
      // When
      const result = parseMoneyAmount("19.99", EN);

      // Then
      assert.equal(result.data, 1999);
      assert.notEqual(19.99 * 100, 1999);
    },
  );

  it(
    "reads the same amount from every launch locale's punctuation",
    function givenOneThousandTwoThirtyFourFiftySix_whenParsedPerLocale_thenAllAgree() {
      // Given / When
      const za = parseMoneyAmount("1 234,56", ZA);
      const en = parseMoneyAmount("1,234.56", EN);
      const fr = parseMoneyAmount("1 234,56", FR);
      const de = parseMoneyAmount("1.234,56", DE);

      // Then
      for (const result of [za, en, fr, de]) {
        assert.equal(result.success, true);
        assert.equal(result.data, 123456);
      }
    },
  );

  it(
    "strips the narrow no-break space French grouping actually uses",
    function givenFrenchGroupingWhitespace_whenParsed_thenItIsNotTreatedAsText() {
      // Given: U+202F, not an ASCII space — the separator Intl really emits.
      // When
      const result = parseMoneyAmount("2 450,00", FR);

      // Then
      assert.equal(result.success, true);
      assert.equal(result.data, 245000);
    },
  );

  it(
    "accepts a pasted amount that still carries its currency symbol",
    function givenASymbolAndSpaces_whenParsed_thenOnlyTheNumberIsRead() {
      // Given / When
      const result = parseMoneyAmount("R 895,50", ZA);

      // Then
      assert.equal(result.success, true);
      assert.equal(result.data, 89550);
    },
  );

  it(
    "pads a short fraction rather than misreading its magnitude",
    function givenOneDecimalPlace_whenParsed_thenItIsPaddedToTheCurrencyScale() {
      // Given / When: "895,5" means 895.50, not 895.05.
      const result = parseMoneyAmount("895,5", ZA);

      // Then
      assert.equal(result.data, 89550);
    },
  );

  it(
    "treats a bare whole number as having no cents",
    function givenNoDecimalSeparator_whenParsed_thenTheFractionIsZero() {
      // Given / When
      const result = parseMoneyAmount("895", ZA);

      // Then
      assert.equal(result.data, 89500);
    },
  );

  it(
    "refuses decimals for a currency that has no minor unit",
    function givenDecimalsOnYen_whenParsed_thenTheIssueIsTooManyDecimalPlaces() {
      // Given / When
      const result = parseMoneyAmount("1250.5", JPY);

      // Then
      assert.equal(result.success, false);
      assert.equal(result.error[0].code, "tooManyDecimalPlaces");
    },
  );

  it(
    "reads a yen amount as whole units, not hundredths",
    function givenYen_whenParsed_thenMinorUnitsEqualMajorUnits() {
      // Given / When
      const result = parseMoneyAmount("245,000", JPY);

      // Then
      assert.equal(result.data, 245000);
    },
  );

  it(
    "rejects more precision than the currency can hold, rather than rounding it away",
    function givenThreeDecimalsOnEuro_whenParsed_thenItIsRejected() {
      // Given / When: silently truncating would lose a cent of someone's money.
      const result = parseMoneyAmount("12,345", { ...DE, separators: { decimal: ",", group: " " } });

      // Then
      assert.equal(result.success, false);
      assert.equal(result.error[0].code, "tooManyDecimalPlaces");
    },
  );

  it(
    "says an empty field is empty rather than zero",
    function givenNothingEntered_whenParsed_thenTheIssueIsEmpty() {
      // Given / When
      const result = parseMoneyAmount("   ", ZA);

      // Then
      assert.equal(result.success, false);
      assert.equal(result.error[0].code, "empty");
    },
  );

  it(
    "refuses text that is not a number",
    function givenLetters_whenParsed_thenTheIssueIsNotANumber() {
      // Given / When
      const result = parseMoneyAmount("eight ninety five", ZA);

      // Then
      assert.equal(result.success, false);
      assert.ok(["notANumber", "empty"].includes(result.error[0].code));
    },
  );

  it(
    "refuses an ambiguous amount with two decimal separators",
    function givenTwoDecimalMarks_whenParsed_thenItIsRejected() {
      // Given / When
      const result = parseMoneyAmount("1,23,45", ZA);

      // Then
      assert.equal(result.success, false);
      assert.equal(result.error[0].code, "multipleDecimalSeparators");
    },
  );

  it(
    "refuses a negative price, since absence means not listed",
    function givenANegativeAmount_whenParsedAsAPrice_thenItIsRejected() {
      // Given / When
      const result = parseMoneyAmount("-100,00", ZA);

      // Then
      assert.equal(result.success, false);
      assert.equal(result.error[0].code, "negativeNotAllowed");
    },
  );

  it(
    "allows a negative amount where the caller says one is meaningful",
    function givenAllowNegative_whenParsed_thenTheSignIsKept() {
      // Given / When
      const result = parseMoneyAmount("-100,00", { ...ZA, allowNegative: true });

      // Then
      assert.equal(result.success, true);
      assert.equal(result.data, -10000);
    },
  );

  it(
    "folds non-Latin digits, because members type on their own keyboards",
    function givenArabicIndicDigits_whenParsed_thenTheyAreRead() {
      // Given / When: ٨٩٥٫٥٠ → 895,50
      const result = parseMoneyAmount("٨٩٥,٥٠", ZA);

      // Then
      assert.equal(result.success, true);
      assert.equal(result.data, 89550);
    },
  );

  it(
    "refuses an amount too large to hold exactly",
    function givenAnAmountBeyondSafeIntegers_whenParsed_thenTheIssueIsTooLarge() {
      // Given / When
      const result = parseMoneyAmount("999999999999999999", ZA);

      // Then
      assert.equal(result.success, false);
      assert.equal(result.error[0].code, "tooLarge");
    },
  );
});

describe("toEditableAmount", () => {
  it(
    "fills an edit field with a plain decimal, not a formatted price",
    function givenMinorUnits_whenMadeEditable_thenThereIsNoSymbolOrGrouping() {
      // Given / When
      const text = toEditableAmount(89550, 2, ",");

      // Then
      assert.equal(text, "895,50");
    },
  );

  it(
    "keeps trailing zeros so the amount does not look changed",
    function givenAWholeAmount_whenMadeEditable_thenTheCentsAreStillShown() {
      // Given / When
      assert.equal(toEditableAmount(89500, 2, ","), "895,00");
    },
  );

  it(
    "pads amounts smaller than one major unit",
    function givenOnlyCents_whenMadeEditable_thenALeadingZeroIsAdded() {
      // Given / When
      assert.equal(toEditableAmount(5, 2, "."), "0.05");
    },
  );

  it(
    "writes no decimal separator for a currency without a minor unit",
    function givenYen_whenMadeEditable_thenThereIsNoFraction() {
      // Given / When
      assert.equal(toEditableAmount(245000, 0, "."), "245000");
    },
  );

  it(
    "round-trips with the parser, which is what makes editing safe",
    function givenAnyStoredAmount_whenEditedAndReparsed_thenItIsUnchanged() {
      // Given
      const amounts = [1, 5, 99, 100, 89550, 245000, 420000, 1];

      // When / Then
      for (const minorUnits of amounts) {
        const text = toEditableAmount(minorUnits, 2, ",");
        const result = parseMoneyAmount(text, ZA);
        assert.equal(result.success, true);
        assert.equal(result.data, minorUnits);
      }
    },
  );
});

describe("MoneyAmountValidator", () => {
  it(
    "composes with the shared Validator helpers like every other rule",
    function givenAValidator_whenUsedWithAccepts_thenItAnswersYesOrNo() {
      // Given
      const validator = MoneyAmountValidator(ZA);

      // When / Then
      assert.equal(validator.validate("895,50").success, true);
      assert.equal(validator.validate("nope").success, false);
    },
  );
});
