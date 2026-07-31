import type { TrustBylineContract } from "../trust/index.js";

export type WineEventType =
  | "sommelier_led"
  | "winemaker_dinner"
  | "tasting"
  | "pairing"
  | "launch";

/**
 * What an event is *about* — events are not wines, but they link to one when
 * relevant (a producer tasting → their label; a masterclass → a grape/style).
 */
export type EventSubjectContract =
  | { kind: "wine"; wineVintageId: string }
  | { kind: "wine_label"; wineLabelId: string }
  | { kind: "producer"; producerId: string }
  | { kind: "region"; regionId: string }
  | { kind: "grape"; grapeVarietyId: string }
  | { kind: "style"; styleName: string };

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
  venueName?: string;
  location?: string;
  seatsAvailable?: number;
  imageUrl?: string;
  /**
   * The host — a producer, sommelier or member — as a trust byline. Fade Yield's
   * "Pouring near you" leads with who's hosting and their verification, so the
   * tasting row can render the mark. Optional until the events api supplies it.
   */
  host?: TrustBylineContract;
  /** What the event is about, when it links to a wine / producer / region. */
  subject?: EventSubjectContract;
};
