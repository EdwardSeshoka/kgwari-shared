import type { WineContract } from "../catalog/index.js";
import type { PublishedCollectionContract } from "../collections/index.js";
import type { ContributionContract } from "../contributions/index.js";
import type { EditorialContract } from "../editorial/index.js";
import type { PublishedEventContract } from "../events/index.js";
import type { ActivityContract, ActivityWineRef, TastingNoteContract } from "../social/index.js";
import type { DiscoverChapterLinkContract } from "./chapterLink.js";
import type { DiscoverDoorwayContract } from "./doorway.js";
import type { CellarTonightRowContract } from "./cellarTonightRow.js";
import type { TonightStatsContract } from "./tonightStats.js";

/**
 * A discover section: a titled, arranged list of domain contracts. The section
 * owns arrangement (id, type, title, order); the items are the same contracts
 * each domain's own api serves, reusable anywhere.
 *
 * The Fade Yield feed reads as a funnel — read → act → explore → go → join →
 * belong: editorial · wines · doorways · shelves · itineraries · events · room.
 * The explore band widened rather than repeated: doorways are entrances derived
 * from the catalogue, shelves and itineraries are lists a person enumerated, and
 * only the first of those three is a query.
 *
 * Neither collection band can carry a Lens, and the type says so rather than a
 * server remembering to — see {@link ../collections!PublishedCollectionContract}.
 *
 * A reader SKIPS a `type` it does not know rather than failing — which is what
 * lets a band ship before every client can draw it.
 */
export type DiscoverSection =
  /**
   * The transactional heart — "Worth opening now". Scannable wine rows; each
   * WineContract already carries its verdict, provenance and trust source.
   */
  | { id: string; type: "wines"; title: string; eyebrow?: string; items: WineContract[] }
  /** Merged browse cards — regions, producers and curated sets as one doorway. */
  | { id: string; type: "doorways"; title: string; eyebrow?: string; items: DiscoverDoorwayContract[] }
  /**
   * Published shelves — lists of BOTTLES somebody made, whether that somebody is
   * a member (a Shelf) or the house (a Selection).
   *
   * NOT a second doorway strip, and the difference is what is behind the card. A
   * doorway's contents come from a QUERY: a region has its wines whether or not
   * anybody arranged them. These contents were enumerated by a person, one at a
   * time, and are derivable from nothing — which is why the card shows what is
   * inside where a doorway shows a photo and a promise. The trust model's merge
   * of regions and collections merged the ENTRANCES; this is the room.
   *
   * Shelf and Selection share one band because they share a subject, and the
   * subject is what the treatment is made of — a cover of overlapping labels, a
   * sub-line counting bottles. What tells them apart is the byline, which is the
   * only place authorship is ever stated.
   */
  | {
      id: string;
      type: "shelves";
      title: string;
      eyebrow?: string;
      /** Pushes SHELVES. Absent when the chapter already shows every one. */
      link?: DiscoverChapterLinkContract;
      items: PublishedCollectionContract[];
    }
  /**
   * Itineraries — the same record, subject `stops`, drawn as a route.
   *
   * A separate `type` for the same payload because a section type on this screen
   * selects a TREATMENT, and the treatment follows the SUBJECT: the places a
   * route calls at have no label to show, so the cover is monogram plates and the
   * sub-line counts stops and what is nested under them. A route also reads in
   * order, because a route has a direction. One card style for bottles and routes
   * would be wrong for one of them.
   *
   * The treatment now has a second axis the shelves band does not: a route is a
   * plan or a record, and {@link ItineraryMode} decides its tense and whether the
   * evenings it names can still be booked. A band that renders every row as a
   * diary is the failure this section type has to survive, which is why the
   * fixtures behind it carry both.
   *
   * A doorway cannot carry this at all — `target` would have to name a wine
   * query, and a weekend in Stellenbosch is not one.
   */
  | {
      id: string;
      type: "itineraries";
      title: string;
      eyebrow?: string;
      /** Pushes ITINERARIES. Absent when the chapter already shows every one. */
      link?: DiscoverChapterLinkContract;
      items: PublishedCollectionContract[];
    }
  | {
      id: string;
      type: "editorial";
      title: string;
      eyebrow?: string;
      /** Pushes ARCHIVE. */
      link?: DiscoverChapterLinkContract;
      items: EditorialContract[];
    }
  | {
      id: string;
      type: "events";
      title: string;
      eyebrow?: string;
      /** Pushes CALENDAR. */
      link?: DiscoverChapterLinkContract;
      items: PublishedEventContract[];
    }
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
   *
   * Carries NO `link`, and the omission is typed rather than merely unset: this
   * chapter already shows everything it is about, so there is no larger thing to
   * push. See {@link DiscoverChapterLinkContract}.
   */
  | {
      id: string;
      type: "cellar_tonight";
      title: string;
      eyebrow?: string;
      items: CellarTonightRowContract[];
    }
  /**
   * Two ways of seeing — readings of ONE bottle that do not agree.
   *
   * ## Why this is a section and not something a client assembles
   *
   * It looks derivable: take the room feed, group by wine, find a bottle with
   * two different verdicts. It is not. WHICH bottle is worth showing a
   * disagreement about, and WHICH two of its readings to set against each
   * other, is an editorial judgement made over the whole corpus — and a client
   * holds one page of it. A client that tried would surface whichever pair its
   * page happened to contain and call that the room disagreeing.
   *
   * ## The wine is named ONCE, over both
   *
   * `wine` sits on the section rather than on each item because the entries are
   * readings of the same thing, and repeating the bottle above each quote is
   * the layout saying twice what the section already said. An item's own
   * `wine` is therefore redundant here and may be omitted.
   *
   * ## The disagreement is in the TIER and the PROSE
   *
   * Never in a negative verdict: the vocabulary has none, deliberately. "An
   * Interesting Discovery" set against "Essential" is the shape a real
   * disagreement takes in this room, and a producer that reaches for a
   * damning word will not find one.
   *
   * At least two items, or the section is not sent.
   */
  | {
      id: string;
      type: "contrast";
      title: string;
      eyebrow?: string;
      /** The bottle every reading here is of. */
      wine: ActivityWineRef;
      items: TastingNoteContract[];
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
