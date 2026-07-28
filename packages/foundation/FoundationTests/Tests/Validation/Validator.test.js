import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Validator } from "../../../dist/index.js";

const AlwaysValid = {
  validate: (input) => Validator.valid(input.trim()),
};

const AlwaysInvalid = {
  validate: () =>
    Validator.invalid(Validator.issue("broken", "Nothing about this is right.")),
};

describe("Validator.issue", () => {
  it(
    "carries a code and a message",
    function givenACodeAndMessage_whenBuilt_thenBothSurvive() {
      // Given / When
      const issue = Validator.issue("tooShort", "Two digits short.");

      // Then
      assert.equal(issue.code, "tooShort");
      assert.equal(issue.message, "Two digits short.");
    },
  );

  it(
    "omits the path entirely when there is none",
    function givenNoPath_whenBuilt_thenThePropertyIsAbsent() {
      // Given / When — absent rather than undefined, so deepEqual against a
      // scalar issue is not tripped by a key nobody set.
      const issue = Validator.issue("tooShort", "Two digits short.");

      // Then
      assert.equal("path" in issue, false);
    },
  );

  it(
    "keeps the path for a value inside a composite",
    function givenAPath_whenBuilt_thenItIsCarried() {
      // Given / When
      const issue = Validator.issue("malformed", "Not an address.", "contact.value");

      // Then
      assert.equal(issue.path, "contact.value");
    },
  );
});

describe("Validator.valid", () => {
  it(
    "carries the normalized value rather than the original",
    function givenANormalizingValidator_whenAccepted_thenTheNormalFormComesBack() {
      // Given / When
      const result = AlwaysValid.validate("  spaced  ");

      // Then
      assert.equal(result.success, true);
      assert.equal(result.data, "spaced");
    },
  );
});

describe("Validator.invalid", () => {
  it(
    "reports every issue, not just the first",
    function givenSeveralIssues_whenRejected_thenAllAreCarried() {
      // Given — one problem at a time makes a caller fix, resubmit, and be
      // told about the next.
      const result = Validator.invalid(
        Validator.issue("notDigits", "Digits only."),
        Validator.issue("wrongLength", "Eight digits."),
      );

      // Then
      assert.equal(result.success, false);
      assert.deepEqual(
        result.error.map((issue) => issue.code),
        ["notDigits", "wrongLength"],
      );
    },
  );
});

describe("Validator.invalidWith", () => {
  it(
    "rejects with an accumulated list",
    function givenAListOfIssues_whenRejected_thenTheListIsCarried() {
      // Given
      const issues = [Validator.issue("notDigits", "Digits only.")];

      // When
      const result = Validator.invalidWith(issues);

      // Then
      assert.equal(result.success, false);
      assert.equal(result.error.length, 1);
    },
  );

  it(
    "refuses to reject a value for no stated reason",
    function givenNoIssues_whenRejected_thenItThrows() {
      // Given / When / Then — "invalid, but I won't say why" is a programming
      // error, not a rejection a caller could act on.
      assert.throws(() => Validator.invalidWith([]), /at least one issue/);
    },
  );
});

describe("Validator.accepts", () => {
  it(
    "reduces a passing validation to true",
    function givenAValidValue_whenAsked_thenTrue() {
      // Given / When / Then
      assert.equal(Validator.accepts(AlwaysValid, "anything"), true);
    },
  );

  it(
    "reduces a failing validation to false",
    function givenAnInvalidValue_whenAsked_thenFalse() {
      // Given / When / Then
      assert.equal(Validator.accepts(AlwaysInvalid, "anything"), false);
    },
  );
});

describe("Validator.describe", () => {
  it(
    "joins every issue into one readable line",
    function givenSeveralIssues_whenDescribed_thenOneLineCoversThemAll() {
      // Given
      const issues = [
        Validator.issue("notDigits", "Digits only."),
        Validator.issue("malformed", "Not an address.", "contact.value"),
      ];

      // When
      const described = Validator.describe(issues);

      // Then
      assert.equal(described, "Digits only. contact.value: Not an address.");
    },
  );
});
