import type { LensContract } from "./lens.js";
import type { LensKey } from "./lensKey.js";

/**
 * The row of chips above a narrowable list.
 *
 * ## Two rules about what is NOT here
 *
 * **A lens with nothing in it is never sent.** The reader is never handed a
 * control that leads to an empty page, which is the one thing a filter must not
 * do — and it is why `count` is never 0.
 *
 * **A row where nothing NARROWS is sent EMPTY.** A lone `lens.all` is the
 * obvious case and it is not the only one: on a day when only the house has
 * published, "All" and "Kgwari" select exactly the same rows, and a second chip
 * that changes nothing is as useless as a first one that does. So the row is
 * sent only when at least two lenses have something of their own to say. It
 * disappears entirely otherwise — which is precisely the thing a tab row can
 * never do, and the clearest demonstration that a lens is not a tab.
 *
 * A client renders nothing for an empty `lenses`. Sending the useless chips and
 * asking every client to suppress them would put one rule in three places.
 */
export type LensRowContract = {
  /**
   * The offered lenses, in the order they read. Fewer than two means render no
   * row at all.
   */
  lenses: LensContract[];
  /**
   * Which one is applied. A list always opens on `lens.all`, so this is that
   * until the reader taps something.
   *
   * On the wire rather than left to the client because the heading and the
   * count under it narrow with the lens, and a page that disagreed with its own
   * chip row about what it was showing would be describing a list the reader is
   * not looking at.
   */
  active: LensKey;
};
