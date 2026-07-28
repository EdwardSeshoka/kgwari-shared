import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  VERIFICATION_CODE_LENGTH,
  VERIFICATION_CODE_PATTERN,
  VerificationCodeValidator,
  validateVerificationCode,
} from "../../../dist/index.js";

const codesOf = (result) => result.error.map((issue) => issue.code);

describe("VERIFICATION_CODE_LENGTH", () => {
  it(
    "matches the length Cognito's EMAIL_OTP challenge issues",
    function givenTheBrokerContract_whenRead_thenItIsEight() {
      // Given / When / Then — pinned deliberately: a client that renders a
      // different number of slots cannot accept a real code, and a server
      // that validates a different length rejects every real code.
      assert.equal(VERIFICATION_CODE_LENGTH, 8);
    },
  );

  it(
    "drives the pattern rather than being restated by it",
    function givenThePattern_whenMeasuredAgainstTheLength_thenTheyAgree() {
      // Given
      const ofExactLength = "1".repeat(VERIFICATION_CODE_LENGTH);
      const oneShort = "1".repeat(VERIFICATION_CODE_LENGTH - 1);

      // When / Then
      assert.equal(VERIFICATION_CODE_PATTERN.test(ofExactLength), true);
      assert.equal(VERIFICATION_CODE_PATTERN.test(oneShort), false);
    },
  );
});

describe("VerificationCodeValidator", () => {
  it(
    "returns the trimmed code so callers send the normal form",
    function givenSurroundingWhitespace_whenValidated_thenTheTrimmedCodeComesBack() {
      // Given — pasted out of a mail client, which brings space with it.
      const result = VerificationCodeValidator.validate("  27970360  ");

      // Then
      assert.equal(result.success, true);
      assert.equal(result.data, "27970360");
    },
  );

  it(
    "says the code is empty rather than merely wrong",
    function givenNothingEntered_whenValidated_thenTheIssueIsEmpty() {
      // Given / When
      const result = VerificationCodeValidator.validate("   ");

      // Then
      assert.equal(result.success, false);
      assert.deepEqual(codesOf(result), ["empty"]);
    },
  );

  it(
    "distinguishes a short code from a malformed one",
    function givenASixDigitCode_whenValidated_thenOnlyTheLengthIsWrong() {
      // Given — the older self-signup length. The digits are fine; there are
      // just too few, and the caller can say exactly that.
      const result = VerificationCodeValidator.validate("279703");

      // Then
      assert.equal(result.success, false);
      assert.deepEqual(codesOf(result), ["wrongLength"]);
    },
  );

  it(
    "reports letters without complaining about length as well",
    function givenLettersAtTheRightLength_whenValidated_thenOnlyTheDigitsAreWrong() {
      // Given
      const result = VerificationCodeValidator.validate("2797036a");

      // Then
      assert.equal(result.success, false);
      assert.deepEqual(codesOf(result), ["notDigits"]);
    },
  );

  it(
    "reports both faults at once when both apply",
    function givenAShortCodeWithLetters_whenValidated_thenBothIssuesCome() {
      // Given — the whole picture in one pass, so a caller is not sent round
      // the loop twice.
      const result = VerificationCodeValidator.validate("27a");

      // Then
      assert.equal(result.success, false);
      assert.deepEqual(codesOf(result), ["notDigits", "wrongLength"]);
    },
  );

  it(
    "counts the digits it actually found in the message",
    function givenAShortCode_whenValidated_thenTheMessageSaysHowShort() {
      // Given / When
      const result = VerificationCodeValidator.validate("279703");

      // Then
      assert.match(result.error[0].message, /8 digits; this one is 6/);
    },
  );
});

describe("validateVerificationCode", () => {
  it(
    "returns true for a code of exactly the issued length",
    function givenAFullLengthCode_whenValidated_thenReturnsTrue() {
      // Given
      const code = "27970360";

      // When
      const result = validateVerificationCode(code);

      // Then
      assert.equal(result, true);
    },
  );

  it(
    "returns true when the code has surrounding whitespace",
    function givenACodeWithSurroundingWhitespace_whenValidated_thenReturnsTrue() {
      // Given — pasted out of a mail client, which brings space with it.
      const code = "  27970360  ";

      // When
      const result = validateVerificationCode(code);

      // Then
      assert.equal(result, true);
    },
  );

  it(
    "returns false for a code that is too short",
    function givenASixDigitCode_whenValidated_thenReturnsFalse() {
      // Given — the older self-signup confirmation length, easily mistaken
      // for this one.
      const code = "279703";

      // When
      const result = validateVerificationCode(code);

      // Then
      assert.equal(result, false);
    },
  );

  it(
    "returns false for a code that is too long",
    function givenANineDigitCode_whenValidated_thenReturnsFalse() {
      // Given
      const code = "279703601";

      // When
      const result = validateVerificationCode(code);

      // Then
      assert.equal(result, false);
    },
  );

  it(
    "returns false when the code contains a non-digit",
    function givenALetterInTheCode_whenValidated_thenReturnsFalse() {
      // Given
      const code = "2797036a";

      // When
      const result = validateVerificationCode(code);

      // Then
      assert.equal(result, false);
    },
  );

  it(
    "returns false when the code contains internal whitespace",
    function givenInternalWhitespace_whenValidated_thenReturnsFalse() {
      // Given
      const code = "2797 0360";

      // When
      const result = validateVerificationCode(code);

      // Then
      assert.equal(result, false);
    },
  );

  it(
    "returns false when the code is empty",
    function givenAnEmptyCode_whenValidated_thenReturnsFalse() {
      // Given
      const code = "";

      // When
      const result = validateVerificationCode(code);

      // Then
      assert.equal(result, false);
    },
  );

  it(
    "does not carry state between calls",
    function givenRepeatedValidation_whenCalledTwice_thenTheAnswerIsStable() {
      // Given — a shared regex with a /g flag would alternate here.
      const code = "27970360";

      // When
      const first = validateVerificationCode(code);
      const second = validateVerificationCode(code);

      // Then
      assert.equal(first, true);
      assert.equal(second, true);
    },
  );
});
