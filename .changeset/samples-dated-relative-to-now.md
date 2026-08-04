---
"@edwardseshoka/samples": minor
---

Express the samples relative to now, where the JSON becomes contracts.

The seeds carry fixed dates and the questions asked of them do not. The front
page's `tonightWindow` is TODAY 16:00 → midnight, recomputed per request, so a
corpus generated in July counts nothing in it: `computeTonightStats` returns
null, and the standing column is absent on every environment seeded from these
samples — permanently, not for a while. The calendar has the same fate on a
longer fuse.

The recorded discover response had the mirror-image problem. It carries its own
`tonight_stats` with a window of 2 August, so an app double replaying it showed
a standing column the backend could not reproduce on any other day. The double
and the server were not disagreeing about shape, which a contract test would
catch; they were disagreeing about WHEN, which nothing was watching.

Both are now slid onto the current evening as they are read. Consumers get
current data without containing a clock: the backend seed maps whatever it is
handed, and the app doubles replay whatever they are handed.

Notes and activities take separate targets inside the window, because
`bottlesOpened` counts both and one kind alone makes it equal `notesWritten` —
the same figure under two labels, one of them then false. The discover response
is anchored on its own window rather than on a row, so the window, the notes
counted inside it, the ledger and the hero's relative time all move together.

Within a set the offset is uniform, so every gap, every ordering and the
ledger's day grouping survive exactly — the corpus slides, it never rearranges.

The generated JSON on disk is untouched and `check:seeds` still passes: this is
a lens over the data, not an edit of it, so the generator stays deterministic.

Regenerating the seeds onto a fresh date would have fixed this for one calendar
day.
