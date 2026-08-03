import { curated } from "../curated.mjs";
import { spread } from "../random.mjs";

const CURATED_CARDS = curated("editorial");
const CURATED_DETAILS = curated("editorial-details");

/**
 * Editorial — the cards, and the pieces behind them.
 *
 * ## Why this became a generated stage
 *
 * `editorial.json` was hand-maintained and therefore outside `--check`
 * entirely: the seed check compared generator output against committed files and
 * simply never looked at this one. It sat on three content types, carried no
 * `saveCount`, and had no detail shape at all long after the detail contract
 * shipped — a gap nothing in the build could report.
 *
 * ## The prose is curated; only the JOIN is generated
 *
 * Nothing here invents a sentence. Both sources are hand-written files kept
 * verbatim, exactly like the curated wines and events — generated prose would be
 * worse than no prose, and a fixture nobody wants to read is a fixture nobody
 * checks. What the stage does is derive the CARD from the piece, so a card and
 * its detail cannot disagree about their title, byline, subject or save count.
 * That was the actual bug risk: two hand-maintained files, one of them a
 * summary of the other.
 *
 * ## The event piece REFERENCES the events domain
 *
 * A detail carrying `eventId` is resolved here against the events seed and the
 * whole `EventContract` is embedded. One dinner, two surfaces — an announcement
 * that restated its own clock would disagree with the list row the first time
 * somebody moved it. An `eventId` that resolves to nothing is a build failure
 * rather than a quietly absent block.
 */
export function buildEditorial({ events }) {
  const eventById = new Map(events.map((event) => [event.id, event]));

  const details = CURATED_DETAILS.map(({ eventId, ...piece }) => {
    if (eventId === undefined) return piece;

    const event = eventById.get(eventId);
    if (event === undefined) {
      throw new Error(
        `editorial detail "${piece.id}" references event "${eventId}", which no seed produces`
      );
    }
    return { ...piece, event };
  });

  const detailById = new Map(details.map((piece) => [piece.id, piece]));

  /**
   * The card for a piece that has a detail — derived, never restated.
   *
   * `description` comes from the standfirst's text: the card's summary IS the
   * piece's standfirst, and maintaining them separately is how a card comes to
   * advertise something the piece no longer says.
   */
  const cardFor = (piece) => ({
    id: piece.id,
    contentType: piece.contentType,
    title: piece.title,
    ...(piece.standfirst ? { description: piece.standfirst.text } : {}),
    ...(piece.imageUrl ? { imageUrl: piece.imageUrl } : {}),
    ...(piece.author ? { author: piece.author } : {}),
    ...(piece.subject ? { subject: piece.subject } : {}),
    ...(piece.saveCount !== undefined ? { saveCount: piece.saveCount } : {})
  });

  const cards = [
    // The curated cards first and verbatim, for the reason every stage keeps its
    // curated rows: `discover/curation.json` references these ids. Where a card
    // now has a detail, the detail's values win — that is the point of deriving.
    ...CURATED_CARDS.map((card) => {
      const detail = detailById.get(card.id);
      return {
        ...card,
        ...(detail ? cardFor(detail) : {}),
        // Every unit the ledger renders reports its saves. A card with a detail
        // takes the piece's count; one without gets its own, from the
        // order-independent hash so it does not move when a piece is added.
        saveCount: detail?.saveCount ?? spread(`${card.id}save`, 0, 260),
        // The curated cards carry copy the detail does not model — a category
        // eyebrow and a cta label are card chrome, not part of the piece.
        ...(card.categoryLabel ? { categoryLabel: card.categoryLabel } : {}),
        ...(card.ctaLabel ? { ctaLabel: card.ctaLabel } : {})
      };
    }),
    // Then a card for every piece that had no card at all — the six content
    // types added in 7.0 had no seed anywhere, so nothing could render them.
    ...details
      .filter((piece) => !CURATED_CARDS.some((card) => card.id === piece.id))
      .map(cardFor)
  ];

  return { cards, details };
}
