import { Validator } from "./Validator.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** What can be wrong with an email address. */
export type EmailIssueCode = "empty" | "malformed";

/**
 * The email rule, as a {@link Validator}. Trims, then lower-cases: an address
 * is not case-sensitive in the part that routes it, and carrying one canonical
 * form means the code that was sent and the code that is verified agree on who
 * they belong to.
 */
export const EmailValidator: Validator<string, string, EmailIssueCode> = {
  validate(input: string) {
    const trimmed = input.trim();

    if (trimmed.length === 0) {
      return Validator.invalid(
        Validator.issue("empty" as const, "No email address was entered."),
      );
    }

    if (!EMAIL_PATTERN.test(trimmed)) {
      return Validator.invalid(
        Validator.issue(
          "malformed" as const,
          "An email address needs a name, an @, and a domain.",
        ),
      );
    }

    return Validator.valid(trimmed.toLowerCase());
  },
};

/** Whether a value is a well-formed email address. */
export function validateEmail(value: string): boolean {
  return Validator.accepts(EmailValidator, value);
}
