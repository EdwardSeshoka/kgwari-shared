/**
 * Helpers shared by every {@link CompositionInterface} implementation.
 *
 * Kept apart from the contract so that reading `CompositionInterface.ts` tells
 * you what a composition *is* without wading through the utilities that happen
 * to help write one — the same split the feature packages already use for
 * `<X>UseCaseInterface.ts` and `<X>UseCase.ts`.
 */
export namespace Composition {
  /**
   * Keeps only the entries that have something in them.
   *
   * The recurring shape in every composition written so far: build the list with
   * a `null` where a section has no content, then drop the nulls. It reads as a
   * declarative list of sections rather than a sequence of `if` blocks pushing
   * onto an accumulator, and it encodes the rule that runs through this whole
   * codebase — **an absent section beats an empty one**. A client should never
   * have to decide whether to render a heading over nothing.
   *
   * @example
   * ```ts
   * return Composition.present([
   *   featured.length > 0 ? { key: "featured_picks", wines: featured } : null,
   *   recent.length > 0 ? { key: "recent", wines: recent } : null,
   * ]);
   * ```
   */
  export function present<T>(entries: readonly (T | null | undefined)[]): T[] {
    return entries.filter((entry): entry is T => entry !== null && entry !== undefined);
  }
}
