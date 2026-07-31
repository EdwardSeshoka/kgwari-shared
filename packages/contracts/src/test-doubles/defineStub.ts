/**
 * Builds a stub factory FROM a contract type, instead of restating it.
 *
 * WHAT THIS REPLACED, AND WHY. Every double used to end its `make` with
 * `... } as SomeContractShape`. A cast is not an annotation: it tells the compiler
 * the answer rather than asking it, and it silenced the one question these doubles
 * exist to ask. A stub could omit a REQUIRED field and typecheck — verified, on
 * `EditorialContract` with `title` deleted. That is precisely the drift the whole
 * package is meant to make impossible, and 23 files were doing it.
 *
 * Here `base` is a PARAMETER of type `T`, so the object literal at the call site is
 * checked against the contract where it is written:
 *
 *     error TS2345: Property 'title' is missing in type '{ id: string; … }'
 *                   but required in type 'EditorialContract'.
 *
 * One cast survives, on the spread result, and it cannot hide a missing field —
 * only reconcile an override that explicitly sets one to `undefined`, which is the
 * thing {@link Overrides} exists to permit. One contained cast, in one file, is the
 * trade for twenty-three uncontained ones.
 */

/**
 * Overrides that may explicitly REMOVE a field.
 *
 * `Partial<T>` cannot, under `exactOptionalPropertyTypes` — and removing is what
 * the interesting tests do: a member with no `region`, an event with no date.
 */
export type Overrides<T> = { [K in keyof T]?: T[K] | undefined };

export function defineStub<T>(base: T): { make(overrides?: Overrides<T>): T } {
  return {
    make(overrides: Overrides<T> = {}): T {
      return { ...base, ...overrides } as T;
    }
  };
}
