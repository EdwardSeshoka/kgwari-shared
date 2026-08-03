import type { DiscoverDoorwayContract } from "@edwardseshoka/contracts/discover";

/**
 * The curation document shape — selection + ordering only. It references content
 * by id and priority and frames the hero; the backend resolves it against the
 * content pools into a `DiscoverContract`. This is shared seed, not composition.
 */
export type CurationContentType =
  | "wine"
  | "article"
  | "guide"
  | "story"
  | "new_arrival"
  | "region"
  | "estate"
  | "event"
  | "room_activity"
  | "collection";

export type CurationItem = {
  contentType: CurationContentType;
  contentId: string;
  priority: number;
};

export type CurationHero = CurationItem & {
  placement: "hero";
  label?: string;
  volume?: number;
  isActive: boolean;
};

export type CurationSectionType =
  | "editorial_cards"
  | "doorway_cards"
  | "collection_shelves"
  | "collection_itineraries"
  | "room_activity"
  | "event_cards";

/**
 * A section that selects pool-backed content by reference (editorial, events,
 * room activity, collections). The backend resolves each ref against that
 * domain's pool.
 *
 * Collections select by reference and NOT inline like doorways, and the
 * difference is ownership. A doorway is merchandising with no life outside the
 * plan — nothing else in the system holds one. A collection is a stored entity
 * with an author who edits it, so inlining it here would fork the truth: the
 * plan's copy would keep saying nine bottles the day its author added a tenth.
 *
 * `collection_shelves` and `collection_itineraries` draw from the same pool, and
 * which band a collection belongs in is decided by its SUBJECT rather than by
 * the plan: a wines collection is drawn as labels and counts bottles, an estates
 * collection as monogram plates and counts places. Merchandising picks which
 * collections appear and in what order — never what they are.
 */
export type CurationRefSection = {
  id: string;
  type:
    | "editorial_cards"
    | "room_activity"
    | "event_cards"
    | "collection_shelves"
    | "collection_itineraries";
  eyebrow?: string;
  title: string;
  description?: string;
  itemRefs: CurationItem[];
};

/**
 * A "Find your way in" section carrying fully-curated browse doorways inline —
 * regions, producers, curated collections and appellations, each with an
 * editorial title, a curator byline and a navigable `target`. Doorways are
 * merchandising, not stored entities, so they live on the plan itself.
 */
export type CurationDoorwaySection = {
  id: string;
  type: "doorway_cards";
  eyebrow?: string;
  title: string;
  description?: string;
  doorways: DiscoverDoorwayContract[];
};

export type CurationSection = CurationRefSection | CurationDoorwaySection;

export type Curation = {
  hero: CurationHero | null;
  sections: CurationSection[];
};
