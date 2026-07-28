import { Validator, type ValidationIssue } from "./Validator.js";

/**
 * Digits in a one-time verification code.
 *
 * Fixed by the broker, not by us: AWS Cognito's managed `EMAIL_OTP` challenge
 * (the `USER_AUTH` flow) issues eight — not the six of the older self-signup
 * confirmation code it is easily mistaken for.
 *
 * This lives in foundation because both ends of the wire have to agree on it
 * and neither owns it. A client that renders the wrong number of slots cannot
 * accept a real code; a server that validates the wrong length rejects every
 * real code before its broker is ever consulted. Both have happened.
 */
export const VERIFICATION_CODE_LENGTH = 8;

/**
 * The pattern a verification code must match. Built from
 * `VERIFICATION_CODE_LENGTH` rather than written out, so the two cannot
 * disagree. Prefer {@link VerificationCodeValidator} — the pattern is exported
 * for schema libraries that want a regex and nothing else.
 */
export const VERIFICATION_CODE_PATTERN = new RegExp(
  `^\\d{${VERIFICATION_CODE_LENGTH}}$`,
);

/**
 * What can be wrong with a verification code. Separated deliberately: "you
 * typed letters" and "you are two digits short" call for different help, and a
 * single `invalid` would let neither be given.
 */
export type VerificationCodeIssueCode = "empty" | "notDigits" | "wrongLength";

const DIGITS_ONLY = /^\d*$/;

/**
 * The verification-code rule, as a {@link Validator}. Accepts surrounding
 * whitespace — codes arrive pasted out of mail clients — and returns the
 * trimmed code, which is what callers should send on.
 */
export const VerificationCodeValidator: Validator<
  string,
  string,
  VerificationCodeIssueCode
> = {
  validate(input: string) {
    const code = input.trim();

    if (code.length === 0) {
      return Validator.invalid(
        Validator.issue("empty" as const, "No verification code was entered."),
      );
    }

    const issues: ValidationIssue<VerificationCodeIssueCode>[] = [];

    if (!DIGITS_ONLY.test(code)) {
      issues.push(
        Validator.issue(
          "notDigits" as const,
          "A verification code is digits only.",
        ),
      );
    }

    if (code.length !== VERIFICATION_CODE_LENGTH) {
      issues.push(
        Validator.issue(
          "wrongLength" as const,
          `A verification code is ${VERIFICATION_CODE_LENGTH} digits; this one is ${code.length}.`,
        ),
      );
    }

    return issues.length > 0
      ? Validator.invalidWith(issues)
      : Validator.valid(code);
  },
};

/** Whether a value is a well-formed verification code. */
export function validateVerificationCode(value: string): boolean {
  return Validator.accepts(VerificationCodeValidator, value);
}
