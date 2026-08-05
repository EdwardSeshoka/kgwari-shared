---
"@edwardseshoka/samples": minor
"@edwardseshoka/contracts": patch
---

Stop seeding rows that have not happened yet, and describe the window the server
actually sends.

`FreshnessTarget` was a UTC time of day — `{ hour: 18, minute: 30 }` — so a set
was slid onto 18:30 "today" whatever the hour it was read. Seeded at 02:00, that
put twenty-five of thirty-four rows in the FUTURE: notes written tomorrow,
check-ins for bottles nobody had opened.

Nothing caught it because the window those rows fed was forward-looking too.
`tonightWindow` ran 16:00 → midnight, which happily contains 18:30 when asked at
02:00, so two wrongs agreed and the seeds looked fresh. The moment the server
began counting a window that ENDS AT THE PRESENT MOMENT — the change that fixes
members outside the server's timezone ever seeing the section at all — every one
of those rows fell outside it and the room's record went empty.

So the target is now minutes-before-now. A row is always in the past, whatever
the hour, and any window ending at the present can see it. Two tests were added
for the two invariants that were missing: that no seeded row is dated ahead of
now, and that the newest lands before now at every hour of the day.

Three more places encoded the old evening and no longer do:

- The recorded discover response carried an eight-hour window and was slid so
  its OPENING landed on 16:00 today. It now carries a rolling day and is slid so
  its CLOSE lands a few minutes ago — the same shape the server produces.
- `TonightWindowContract` said "tonight is not a duration: it is a local
  evening". Neither half was ever true of what the server sent: the hours were
  UTC and nothing else was, so a member in Auckland had their whole evening
  outside the window while the figures inside it were drawn from the entire
  world. The doc now describes a rolling window, says the figures are global,
  and says a consumer must not name a time of day from it.
- The freshness suite's own `tonightWindow` helper mirrored the evening, which
  is why a future-dated seed passed a test asserting it was fresh. It mirrors
  the rolling window now.

No contract shape changes — `{ from, to }` was always right. Only what it means,
and what the seeds put inside it.
