import type { PublishedCollectionContract } from "./collection.js";
import type { CollectionItemContract } from "./collectionItem.js";

/**
 * Opening a list — the endpoint the card has always promised and never had.
 *
 * `CollectionContract` says outright that the card shows a preview and "the
 * ordered list belongs to the collection's own endpoint". That endpoint did not
 * exist, so every surface could show a shelf and none could open one.
 *
 * `null` when the collection is not published or does not exist — the two are
 * the same fact to a reader, and distinguishing them would tell a stranger that
 * a private list is there.
 */
export type GetCollectionResponse = {
  item: PublishedCollectionContract | null;
  /**
   * The contents, IN THE AUTHOR'S ORDER.
   *
   * Beside the collection rather than inside it, matching the split the card
   * already makes: one shape describes the list, another its contents. It also
   * keeps the card cheap — a Discover chapter of six shelves must not carry six
   * full item lists to render six titles.
   *
   * Empty is a real state and not an error: a member can publish a list and then
   * empty it, and a page saying so is better than a page pretending the list is
   * missing.
   */
  items: CollectionItemContract[];
};
