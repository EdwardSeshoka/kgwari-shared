import type { Result } from "../Result.js";

/**
 * One specific thing wrong with a value.
 *
 * `code` is the part callers branch on — stable, machine-readable, and
 * unaffected by copy changes. `message` explains it to whoever is reading logs
 * or a validation response; it is developer-facing and never member-facing, so
 * presentation stays free to say something kinder in the member's own language.
 */
export interface ValidationIssue<Code extends string = string> {
  readonly code: Code;
  readonly message: string;
  /** Dotted path within a composite value. Absent for scalars. */
  readonly path?: string;
}

/**
 * Everything wrong with a value, not merely the first thing. Stopping at the
 * first issue makes a caller fix one problem, resubmit, and be told about the
 * next — so validators report the full picture in one pass.
 */
export type ValidationFailure<Code extends string = string> = readonly ValidationIssue<Code>[];

/** Valid values come back normalized; invalid ones come back explained. */
export type ValidationResult<Value, Code extends string = string> = Result<
  Value,
  ValidationFailure<Code>
>;

/**
 * Generic validation contract, the counterpart to {@link Mapper} and `UseCase`.
 *
 * `validate` always returns a {@link Result}: rejection is *returned*, never
 * thrown, so the caller decides what a rejection means — a 400, a field error,
 * a disabled button. A validator that answered only true/false would push that
 * decision onto every call site and throw away the reason along the way.
 *
 * The output type lets a validator narrow or normalize as it accepts: trimming,
 * lower-casing, or parsing into a stricter type. Callers should use the
 * returned value rather than the one they passed in.
 *
 * @typeParam Input - What arrives, usually straight from a wire or a field.
 * @typeParam Output - What a valid value becomes. Defaults to `Input`.
 * @typeParam Code - The union of issue codes this validator can report, so
 * callers get exhaustive switches instead of string guesses.
 *
 * @example Branching on a specific failure
 * ```ts
 * const result = VerificationCodeValidator.validate(typed);
 * if (!result.success) {
 *   const wrongLength = result.error.some((issue) => issue.code === "wrongLength");
 *   return wrongLength ? askForAllEightDigits() : askForDigitsOnly();
 * }
 * submit(result.data); // normalized
 * ```
 *
 * @example Only the yes/no answer
 * ```ts
 * const enabled = Validator.accepts(VerificationCodeValidator, typed);
 * ```
 */
export interface Validator<Input, Output = Input, Code extends string = string> {
  validate(input: Input): ValidationResult<Output, Code>;
}

export namespace Validator {
  /** Builds one issue. */
  export function issue<Code extends string>(
    code: Code,
    message: string,
    path?: string,
  ): ValidationIssue<Code> {
    return path === undefined ? { code, message } : { code, message, path };
  }

  /** Accepts a value, carrying the normalized form forward. */
  export function valid<Value>(value: Value): Result<Value, never> {
    return { success: true, data: value };
  }

  /** Rejects a value with every issue found. At least one is required. */
  export function invalid<Code extends string>(
    first: ValidationIssue<Code>,
    ...rest: ValidationIssue<Code>[]
  ): Result<never, ValidationFailure<Code>> {
    return { success: false, error: [first, ...rest] };
  }

  /**
   * Rejects a value with a list built elsewhere — the usual shape when issues
   * are accumulated in a loop. An empty list would mean "invalid for no reason",
   * so it is a programming error rather than a rejection.
   */
  export function invalidWith<Code extends string>(
    issues: ValidationFailure<Code>,
  ): Result<never, ValidationFailure<Code>> {
    if (issues.length === 0) {
      throw new Error("A rejection must carry at least one issue.");
    }
    return { success: false, error: issues };
  }

  /**
   * The yes/no answer, for call sites that genuinely have nothing to say about
   * the reason — enabling a button, guarding a round trip.
   */
  export function accepts<Input, Output, Code extends string>(
    validator: Validator<Input, Output, Code>,
    input: Input,
  ): boolean {
    return validator.validate(input).success;
  }

  /** Every issue as one line, for logs and error messages. */
  export function describe<Code extends string>(issues: ValidationFailure<Code>): string {
    return issues
      .map((issue) => (issue.path ? `${issue.path}: ${issue.message}` : issue.message))
      .join(" ");
  }
}
