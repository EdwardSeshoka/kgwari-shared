import type { DiscoverIndexPush } from "./indexPush.js";

/**
 * A chapter's push.
 *
 * An object rather than a bare {@link DiscoverIndexPush} so the destination can
 * later carry the lens it should open on — arriving at SHELVES already narrowed
 * to sommeliers is a real affordance, and a bare string has nowhere to put it.
 */
export type DiscoverChapterLinkContract = {
  push: DiscoverIndexPush;
};
