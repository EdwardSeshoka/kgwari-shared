/**
 * An event — one entity, two surfaces.
 *
 * The list row in Discover ("Pouring near you") and the editorial event piece
 * ("What estates publish") are the SAME event, and this contract is the one
 * place its clock, its venue and its capacity live. The alternative was an
 * editorial piece carrying its own `starts_at`, its own room and its own seat
 * count, which is two records of one dinner that disagree the first time
 * somebody moves it an hour later.
 *
 * ## Times
 *
 * Instants are UTC ISO-8601 and NEVER formatted. "24 July, 6pm" is a sentence in
 * one language, and a wire that carries it has already chosen the reader's.
 *
 * {@link EventContract.timezone} is the VENUE'S zone, and it is not the same
 * information as the instant. A member in Lisbon reading about a Stellenbosch
 * dinner needs to know it starts at seven in Stellenbosch; their own zone is
 * resolved at render and never stored, because storing it would date the record
 * to whoever loaded it first.
 */

import type { TrustBylineContract } from "../trust/index.js";
import type { EventAdmissionContract } from "./admission.js";
import type { EventBookingContract } from "./booking.js";
import type { EventLifecycleContract } from "./lifecycle.js";
import type { EventPanellistContract } from "./panellist.js";
import type { EventRecapContract } from "./recap.js";
import type { EventSubjectContract } from "./subject.js";
import type { EventVenueContract } from "./venue.js";
import type { EventVisibility } from "./visibility.js";
import type { WineEventType } from "./eventType.js";

/**
 * A wine event. `startDateTime` is ISO-8601 data; display labels (relative time,
 * event-type label) are derived on the client, not carried on the wire.
 */
export type EventContract = {
  id: string;
  title: string;
  /**
   * BCP 47 tag the title was authored in.
   *
   * A tasting title is curated PROSE, unlike an estate or region name, so the
   * language it was written in is part of the fact. Search sends it as
   * `NegotiatedText` carrying this tag; without it the row has to guess, and
   * guessing "en" is how an Afrikaans title gets served as though it were a
   * translation.
   */
  titleLanguage?: string;
  eventType?: WineEventType;
  startDateTime?: string;
  /**
   * When it ends. A dinner and a two-day symposium are both events, and only one
   * of them can be described by a start time.
   */
  endDateTime?: string;
  /**
   * IANA zone of the VENUE, e.g. "Africa/Johannesburg".
   *
   * Not the reader's, which is resolved at render and never stored. The instants
   * above are absolute; this is what lets a client say "18:00 in Stellenbosch"
   * to somebody in Lisbon instead of silently converting and being wrong about
   * which evening it is.
   */
  timezone?: string;
  /** Structured location. Prefer this over the two flat fields below. */
  venue?: EventVenueContract;
  /** @deprecated Compatibility alias for `venue.name.text` (equals it). Prefer `venue`. */
  venueName?: string;
  /** @deprecated Compatibility alias for `venue.city.text` (equals it). Prefer `venue`. */
  location?: string;
  /**
   * What it will be conducted in, BCP 47, in order of prominence.
   *
   * A fact a member needs before booking rather than after: a masterclass run in
   * Afrikaans is a different evening for somebody who does not speak it, and no
   * amount of interface translation changes that.
   */
  languages?: string[];
  admission?: EventAdmissionContract;
  /**
   * Total seats. ABSENT MEANS UNCAPPED, not unknown — a walk-in tasting has no
   * number and rendering "0 seats" for it excludes nobody from anything.
   */
  capacity?: number;
  /** Seats taken. An integer, never a percentage — "82 % full" is a formatted lie. */
  taken?: number;
  /**
   * Seats left. Equals `capacity - taken` when both are known.
   *
   * Kept as its own field because it is what a list row renders and because a
   * host may know they have four left without publishing how many they started
   * with. Zero is a STATEMENT (sold out); absent is uncapped.
   */
  seatsAvailable?: number;
  imageUrl?: string;
  /**
   * The host — a producer, sommelier or member — as a trust byline. Fade Yield's
   * "Pouring near you" leads with who's hosting and their verification, so the
   * tasting row can render the mark. Optional until the events api supplies it.
   */
  host?: TrustBylineContract;
  /** Who is speaking or pouring, in running order. */
  panel?: EventPanellistContract[];
  lifecycle?: EventLifecycleContract;
  booking?: EventBookingContract;
  recap?: EventRecapContract;
  /**
   * How many notes members filed against wines poured here.
   *
   * READ AT RENDER from the register, never cached onto the event. It moves
   * every time somebody writes about the evening, and a stored copy is a number
   * that was true once — which is the failure mode the record model exists to
   * avoid.
   */
  notesFiled?: number;
  /**
   * Who this evening is for. Absent reads as `"published"`.
   *
   * A private event is the whole feature minus the audience; the restriction it
   * expresses is on reach, not on the verb. See {@link EventVisibility}.
   */
  visibility?: EventVisibility;
  /** How many members have saved this event. A count, not a score. */
  saveCount?: number;
  /** What the event is about, when it links to a wine / producer / region. */
  subject?: EventSubjectContract;
};
