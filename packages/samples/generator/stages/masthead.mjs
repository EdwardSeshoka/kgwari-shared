import { curated } from "../curated.mjs";
import { spread } from "../random.mjs";

const CURATED = curated("discover");

/**
 * The Masthead v2 discover page — the settled design, and now THE discover
 * response.
 *
 * It briefly shipped as a second fixture beside the v1 snapshot so the backend's
 * contract test would keep passing. That was the wrong shape to leave behind: two
 * discover payloads is two answers to one question, and the one a reader picks
 * would be whichever they found first. The v1 snapshot is gone and this is what
 * `createDiscover` returns.
 *
 * The backend's `composeDiscover` has to produce it. Until it does, the contract
 * test asserting the two match is red — deliberately, because that is the work
 * being tracked rather than a fixture pretending it is not needed.
 *
 * ## v2 ADDS; it does not quietly remove
 *
 * The doorways and the room feed are carried over verbatim from the v1 page.
 * The change brief lists additions — a note hero, the ledger, tonight — and says
 * nothing about dropping "Find your way in", so dropping it would be a design
 * decision taken by a generator. Their curated copy comes through untouched.
 *
 * ## Everything else here resolves to a seed that exists
 *
 * The hero is a note from the note corpus, the ledger interleaves real notes,
 * pieces and evenings, and the cellar rows point at catalogue wines. That is the
 * whole reason this is generated rather than hand-written: a fixture with an id
 * in it that resolves to nothing is how the discover hero broke silently the
 * last time one was maintained by hand.
 */
export function buildMasthead({ wines, notes, editorial, events, users, collections }) {
  // The room chooses the lede: the most-saved note leads the page, which is the
  // mechanism the note hero exists for rather than an editor's pick.
  const roomNotes = notes.filter((note) => note.visibility !== "private");
  const lede = [...roomNotes].sort((a, b) => (b.saveCount ?? 0) - (a.saveCount ?? 0))[0];

  /**
   * The Latest ledger — one chronological run, kinds interleaved.
   *
   * The page around it is interleaved too, by ANATOMY: the index-row chapters
   * are dealt apart and the date blocks, the article and the contrast band sit
   * between them. Three row chapters set adjacently read as one long
   * undifferentiated list however carefully each is set — which is the same
   * match-form-to-function rule that made them rows rather than cards.
   *
   * Sorted on `createdAt` ACROSS kinds and nothing else. A story filed at 09:02
   * and a note at 10:15 have exactly one correct order, and it is not "notes
   * first" — which is the property the contract's envelope was shaped for and
   * the one a fixture grouped by kind would quietly fail to exercise.
   */
  const contributions = [
    ...roomNotes.slice(0, 6).map((note) => ({
      id: `contribution_${note.id}`,
      kind: "note",
      createdAt: note.createdAt,
      author: note.user,
      ...(note.saveCount !== undefined ? { saveCount: note.saveCount } : {}),
      note
    })),
    ...editorial.cards.slice(0, 3).map((card, i) => ({
      id: `contribution_${card.id}`,
      kind: "editorial",
      // Spread across the same window the notes fall in, so the interleave is a
      // real one rather than three stories sitting in a block at the top.
      createdAt: `2026-07-${String(12 + i * 3).padStart(2, "0")}T09:02:00.000Z`,
      author: {
        id: `user_${(card.author?.name ?? "kgwari").toLowerCase().replace(/\s+/g, "_")}`,
        displayName: card.author?.name ?? "Kgwari",
        ...(card.author?.tier ? { tier: card.author.tier } : {}),
        ...(card.author?.role ? { role: card.author.role } : {})
      },
      ...(card.saveCount !== undefined ? { saveCount: card.saveCount } : {}),
      editorial: card
    })),
    ...events
      .filter((event) => event.visibility !== "private")
      .filter((event) => event.lifecycle === "past")
      .slice(0, 2)
      .map((event, i) => ({
        id: `contribution_attended_${event.id}`,
        kind: "tasting",
        createdAt: `2026-07-${String(13 + i * 4).padStart(2, "0")}T21:40:00.000Z`,
        author: {
          id: users[i].id,
          displayName: users[i].displayName,
          initials: users[i].initials,
          ...(users[i].status ? { status: users[i].status } : {})
        },
        event
      })),
    ...collections.all.slice(0, 2).map((collection) => ({
      id: `contribution_${collection.id}`,
      kind: "collection",
      createdAt: `2026-07-${String(14 + collections.all.indexOf(collection)).padStart(2, "0")}T12:05:00.000Z`,
      author: {
        id: `user_${collection.author.name.toLowerCase().replace(/\s+/g, "_")}`,
        displayName: collection.author.name,
        ...(collection.author.tier ? { tier: collection.author.tier } : {}),
        ...(collection.author.status ? { status: collection.author.status } : {}),
        ...(collection.author.role ? { role: collection.author.role } : {})
      },
      ...(collection.saveCount !== undefined ? { saveCount: collection.saveCount } : {}),
      collection
    }))
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  /**
   * From your cellar tonight — the member-scoped join no other section makes.
   *
   * `activityCount` is WINDOWED and deliberately small next to the wine's own
   * lifetime `noteCount`. That contrast is the fixture's job: a consumer that
   * renders either number in the other's sentence says something false.
   */
  const cellarTonight = wines.slice(0, 3).map((wine) => ({
    wine: {
      id: wine.id,
      ...(wine.wineLabelId ? { wineLabelId: wine.wineLabelId } : {}),
      name: wine.name,
      ...(wine.estate ? { producerName: wine.estate } : {}),
      ...(wine.vintage ? { vintage: wine.vintage, vintageDisplay: String(wine.vintage) } : {})
    },
    activityCount: 1 + spread(`${wine.id}tonight`, 0, 5),
    bottlesHeld: 1 + spread(`${wine.id}bottles`, 0, 3)
  }));

  /**
   * Two ways of seeing — one bottle, two readings that do not agree.
   *
   * Picked here rather than left to a client for the reason the contract gives:
   * WHICH bottle is worth showing a disagreement about is a judgement over the
   * whole corpus, and a client holds one page of it. The rule is the widest
   * verdict distance among bottles the room actually argued over, which is a
   * defensible one a generator can state and a reader can check.
   *
   * The pair is set against each other by TIER and PROSE. There is no negative
   * verdict in the vocabulary to reach for, deliberately.
   */
  const VERDICT_RANK = ["An Interesting Discovery", "Worth Revisiting", "Essential", "Unforgettable"];
  const rank = (note) => VERDICT_RANK.indexOf(note.verdict ?? "");

  const notesByWine = new Map();
  for (const note of roomNotes) {
    if (rank(note) < 0) continue;
    const forWine = notesByWine.get(note.wineVintageId) ?? [];
    forWine.push(note);
    notesByWine.set(note.wineVintageId, forWine);
  }

  const contrast = [...notesByWine.values()]
    .map((forWine) => {
      const sorted = [...forWine].sort((a, b) => rank(a) - rank(b));
      return { low: sorted[0], high: sorted[sorted.length - 1] };
    })
    .filter((pair) => rank(pair.high) > rank(pair.low))
    .sort((a, b) => rank(b.high) - rank(b.low) - (rank(a.high) - rank(a.low)))[0];

  const window = { from: "2026-08-02T16:00:00.000Z", to: "2026-08-03T00:00:00.000Z" };

  /** A v1 section, carried through as authored. */
  const carried = (type) => CURATED.sections.find((section) => section.type === type);

  return {
    hero: {
      kind: "note",
      feature: { eyebrow: "FROM THE ROOM", label: "Tonight", volume: 47 },
      note: lede
    },
    sections: [
      {
        id: "latest",
        type: "contributions",
        title: "Latest",
        eyebrow: "THE LEDGER",
        items: contributions
      },
      {
        id: "worth_opening_now",
        type: "wines",
        title: "Worth opening now",
        items: wines.slice(0, 5)
      },
      {
        id: "pouring_near_you",
        type: "events",
        title: "Pouring near you",
        link: { push: "calendar" },
        items: events
          .filter((event) => event.visibility !== "private")
          .filter((event) => event.lifecycle === "open")
          .slice(0, 4)
      },
      {
        id: "shelves_worth_following",
        type: "shelves",
        title: "Shelves worth following",
        eyebrow: "LISTS SOMEBODY MADE",
        link: { push: "shelves" },
        items: collections.shelves.items.slice(0, 2)
      },
      {
        id: "an_estate_writes",
        type: "editorial",
        title: "An estate writes",
        // Chapter 07 pushes ARCHIVE. The label is not sent: the destination set
        // is closed, so the word renders from the key per locale.
        link: { push: "archive" },
        items: editorial.cards.slice(0, 4)
      },
      {
        id: "where_to_go_next",
        type: "itineraries",
        title: "Where to go next",
        eyebrow: "IN THE ORDER SOMEBODY DROVE THEM",
        link: { push: "itineraries" },
        items: collections.itineraries.items.slice(0, 2)
      },
      carried("doorways"),
      // The section is only sent when the room genuinely disagreed. A "contrast"
      // band over two people saying the same thing is the fixture teaching a
      // consumer that the chapter means nothing.
      ...(contrast
        ? [
            {
              id: "two_ways_of_seeing",
              type: "contrast",
              title: "Two ways of seeing",
              eyebrow: "ONE BOTTLE",
              wine: contrast.high.wine,
              // The dissent leads. The page is arguing with the consensus, not
              // presenting the consensus and then qualifying it.
              items: [contrast.low, contrast.high].map(({ wine, ...note }) => note)
            }
          ]
        : []),
      carried("room"),
      {
        id: "from_your_cellar_tonight",
        type: "cellar_tonight",
        title: "From your cellar tonight",
        eyebrow: "YOURS",
        items: cellarTonight
      },
      {
        id: "tonight",
        type: "tonight_stats",
        title: "Tonight",
        stats: {
          window,
          bottlesOpened: 148,
          notesWritten: 92,
          // A count, never a percentage. "63 % of tonight's notes" is a formatted
          // number, an English word order and a plural rule in one string.
          notesByProfessionals: 31,
          mostOpened: cellarTonight[0]
        }
      }
    ]
  };
}
