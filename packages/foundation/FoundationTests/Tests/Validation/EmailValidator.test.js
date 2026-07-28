import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { EmailValidator } from "../../../dist/index.js";

describe("EmailValidator", () => {
  it(
    "returns one canonical form so both ends agree who the address belongs to",
    function givenMixedCaseAndSpace_whenValidated_thenTheCanonicalFormComesBack() {
      // Given / When
      const result = EmailValidator.validate("  Alex@Example.COM ");

      // Then
      assert.equal(result.success, true);
      assert.equal(result.data, "alex@example.com");
    },
  );

  it(
    "says the address is empty rather than merely wrong",
    function givenNothingEntered_whenValidated_thenTheIssueIsEmpty() {
      // Given / When
      const result = EmailValidator.validate("  ");

      // Then
      assert.equal(result.success, false);
      assert.equal(result.error[0].code, "empty");
    },
  );

  it(
    "reports a malformed address as malformed",
    function givenNoAtSign_whenValidated_thenTheIssueIsMalformed() {
      // Given / When
      const result = EmailValidator.validate("person.example.com");

      // Then
      assert.equal(result.success, false);
      assert.equal(result.error[0].code, "malformed");
    },
  );
});
