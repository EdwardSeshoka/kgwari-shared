import type { WineContract } from "../catalog/index.js";
import type { ContributionContract } from "../contributions/index.js";
import type { EditorialContract } from "../editorial/index.js";
import type { EventContract } from "../events/index.js";
import type { ActivityContract } from "../social/index.js";
import type { DiscoverDoorwayContract } from "./doorway.js";
import type { CellarTonightRowContract } from "./cellarTonightRow.js";
import type { TonightStatsContract } from "./tonightStats.js";

/**
 * A discover section: a titled, arranged list of domain contracts. The section
 * owns arrangement (id, type, title, order); the items are the same contracts
 * each domain's own api serves, reusable anywhere.
 *
 * The Fade Yield feed reads as a funnel — read → act → explore → join → belong:
 *   editorial · wines · doorways · events · room.
 */
export type DiscoverSection =
  /**
   * The transactional heart — "Worth opening now". Scannable wine rows; each
   * WineContract already carries its verdict, provenance and trust source.
   */
  | { id: string; type: "wines"; title: string; eyebrow?: string; items: WineContract[] }
  /** Merged browse cards — regions, producers and curated sets as one doorway. */
  | { id: string; type: "doorways"; title: string; eyebrow?: string; items: DiscoverDoorwayContract[] }
  | { id: string; type: "editorial"; title: string; eyebrow?: string; items: EditorialContract[] }
  | { id: string; type: "events"; title: string; eyebrow?: string; items: EventContract[] }
  | {
      id: string;
      type: "room";
      title: string;
      eyebrow?: string;
      description?: string;
      items: ActivityContract[];
    }
  /**
   * The Latest ledger — one chronological run of everything the room produced,
   * notes and writing interleaved.
   *
   * Distinct from `room`, which is a feed of what members DID with bottles. This
   * is what they ADDED, and the ordering across kinds is the whole point: see
   * {@link ../contributions!ContributionContract}.
   */
  | {
      id: string;
      type: "contributions";
      title: string;
      eyebrow?: string;
      items: ContributionContract[];
    }
  /**
   * "From your cellar tonight" — MEMBER-SCOPED, and the only section here that
   * is. Absent entirely for a signed-out reader, and absent rather than empty
   * for a member whose bottles nobody is drinking: a heading over nothing is
   * worse than no heading.
   */
  | {
      id: string;
      type: "cellar_tonight";
      title: string;
      eyebrow?: string;
      items: CellarTonightRowContract[];
    }
  /**
   * The standing record for the evening. ONE payload, not a list — which is why
   * it carries `stats` rather than `items`, instead of pretending to be a
   * one-element collection.
   */
  | {
      id: string;
      type: "tonight_stats";
      title: string;
      eyebrow?: string;
      stats: TonightStatsContract;
    };
