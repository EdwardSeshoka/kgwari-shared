/**
 * Generic composition contract, the counterpart to `Mapper`, `Validator` and
 * `UseCase`.
 *
 * A **Mapper** turns one thing into one other thing — the same subject in a
 * different representation — and it may fail, because its input can be
 * malformed. A **Composition** assembles SEVERAL things into one that did not
 * exist before: a catalogue and a market become a set of collections; wines,
 * regions, editorial, events and activities become a discover page.
 *
 * ## Why it cannot fail
 *
 * There is no `Result` here, and that is the contract's whole statement.
 * Composition **degrades, it does not reject**: a source that is missing or
 * empty means an absent section, not an error. A discover page with no events is
 * a valid discover page; a catalogue with nothing featured simply has no
 * featured collection.
 *
 * Making composition failable would push a decision onto every caller that none
 * of them can answer — a presentation layer handed `Result<DiscoverContract>`
 * has nothing useful to do with the failure except render the empty page that
 * composing would have given it anyway. Anything that genuinely can fail is a
 * `Mapper` or a `Validator`, and should be one.
 *
 * ## Configuration goes in the constructor, inputs go in `compose`
 *
 * The distinction is what makes this an interface a class implements rather than
 * an object literal like `Mapper`. **Configuration is decided once** — which
 * market a catalogue is read from, how many items a section holds. **Input
 * varies per call** — which wines, which events. Folding both into one argument
 * bundle hides that difference and makes every call site restate settings that
 * never change.
 *
 * @typeParam Sources - The named bundle of INPUTS this composition assembles.
 * @typeParam Output - What gets built.
 *
 * @example
 * ```ts
 * export class WineCollectionsComposition
 *   implements CompositionInterface<{ wines: readonly WineContract[] }, WineCollectionContract[]>
 * {
 *   constructor(private readonly homeMarket: string = "ZA") {}
 *
 *   compose({ wines }: { wines: readonly WineContract[] }): WineCollectionContract[] {
 *     …
 *   }
 * }
 *
 * const collections = new WineCollectionsComposition("FR").compose({ wines });
 * ```
 */
export interface CompositionInterface<Sources, Output> {
  compose(sources: Sources): Output;
}
