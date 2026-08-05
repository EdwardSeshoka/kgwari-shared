---
"@edwardseshoka/contracts": major
"@edwardseshoka/samples": major
---

Rebuild the itinerary out of stops, and give a route's notes one ledger row.

An itinerary was a collection of estates: one producer per row. A real route does
not survive that. Somebody documenting the Franschhoek wine tram arrives at
Grande Provence, tastes four things, writes up two, takes the 14:00 tram, and
eats at the estate she started from. The old shape held the estates and nothing
else — and the fixture had already outgrown it, describing "three cellar doors,
one long lunch, and one designated driver" above an `itemCount` of five whose
subject said estates. Five what?

**A row is now an OCCASION, not a thing.** `ItineraryStopContract` carries the
`place` it calls at — required, because a stop you cannot go to is not a stop —
and what happened there: the `wines` poured, the `notes` written, and the `event`
it was. `CollectionSubject` gains `stops`, `CollectionItemContract` gains a third
arm, and `itemCount` finally counts honestly: a route that has lunch where it
started called at four places and made five stops, which the old shape could
report only by listing an estate twice or losing the evening.

**This does not reopen the mixed-container question, and must not be read as
doing so.** A route's rows are all stops — one subject, like every other
collection. What is mixed is what a stop CONTAINS, one level down. Nesting is not
mixing: the question a member asks is "what did we do at Kanonkop", never "is
this row a wine or a place", and Save remains the only flat bag of unlike things.

**A stop owns no content of its own.** Every field points at a record that
already exists — a producer, a vintage, a note, an event. There is deliberately
no prose field and no photo on the stop, and the cost is named in the contract: a
remark about the PLACE rather than a wine has nowhere to go, and today goes in the
route's `description`. If stops must speak, the answer is a note about a place in
the social domain, never a string here — a string would grow a language tag, then
a verdict, and arrive at being a note by accretion with none of a note's
moderation or authorship.

**`TastingNoteContract.origin` gives a day one row.** Nine notes written on the
tram are one ACT: publishing the route. A note carrying an origin gets no
`ContributionContract` row of its own and counts 1 in the ledger, not 9 — the same
call `tasting` already made, where the row is the attendance rather than each
thing poured at it. The note declares it rather than the server joining it,
because a shape a producer cannot construct beats a filter every stream has to
remember.

Suppressing the ROW is not suppressing the NOTE. The ledger records acts; a
wine's page records opinions. All nine still attach to their vintages, still count
toward that wine's note count, still feed the register, and can still be promoted
as its most-saved note.

**`ItineraryMode` puts a tense on the card.** A plan and a write-up are the same
record pointed in opposite directions, and only one of them may offer a way to
book the evenings it names. Sent rather than derived from "has anything been
written yet": a member writing up her day would watch the card flip halfway
through the first note, taking the booking buttons on the remaining stops with it.
Absence means opposite things in the two modes — a planned stop with no wines is
complete, a documented one is a draft.

**`ItineraryContentsContract` is the one second count a collection may carry.**
The card gets a sub-line — "5 stops · 9 wines · 4 notes" — instead of the notes
themselves; embedding them would give back everything `CollectionPreviewItem`
bought on the app's most-requested endpoint. It is not a second subject: the
subject is stops, `itemCount` counts them, and these count what is nested inside.
Absent on a plan, and "0 wines · 0 notes" there is an empty diary rather than a
plan.

BREAKING, and one break is silent. The itineraries landing must now request
`subject: "stops"`; a client still sending `estates` gets an EMPTY PAGE rather
than an error, because that value stays valid for a derived list of producers.
`estates` is now the derived side only — "estates you follow" is a Lens over the
producer records Save makes savable, and freezing it yields a route whose stops
each carry one, not a list of estates. Consumers switching exhaustively over
`CollectionSubject` or `CollectionItemContract` will see the new arm.

Also: every ledger and Writing-stream producer must now drop origin-bearing notes,
or one member's Saturday buries the room. `preview.contentId` on a route keys on
the STOP and not the place, so a strip keyed on the producer draws one plate for
two stops. `CollectionContract.StubFactory.makeItinerary` returns the narrower
`ItineraryCollectionContract` and is now documented; `makePlannedItinerary` is
new, as are `ItineraryStopContract.StubFactory` (planned, silent, at-event,
unwritten, revisit) and `TastingNoteContract.StubFactory.makeFromItinerary`.
