/**
 * The condition of the BOTTLE, which is not the quality of the WINE.
 *
 * ## The invariant this vocabulary exists to make enforceable
 *
 * **A fault never counts against the wine's record.** A corked bottle is a
 * failed closure, a heat-damaged one is a failed courier, and neither is
 * evidence about what the estate made. The server therefore EXCLUDES faulted
 * notes from every register aggregation — the verdict distribution, the scale
 * means, the aroma mentions, the colour reading. That exclusion is server
 * policy, not a client filter: a client that had to know which conditions were
 * disqualifying would be a client that ships to change the rule.
 *
 * The member still gets to file the note. Recording a corked bottle is how a
 * member remembers the evening and how a distributor learns about a bad case;
 * what it must not do is drag a wine's standing down for something the wine did
 * not do.
 *
 * `condition.noFaults` is a real answer, not the absence of one — a taster
 * saying the bottle was sound is a statement, and a note that never answered is
 * a different fact from one that answered "clean".
 */
export const BOTTLE_CONDITIONS = [
  "condition.noFaults",
  "condition.corked",
  "condition.oxidised",
  "condition.reduced",
  "condition.heatDamaged",
  "condition.volatile",
  "condition.refermented"
] as const;

export type BottleConditionKey = (typeof BOTTLE_CONDITIONS)[number];

/**
 * The conditions that disqualify a note from the register, stated once.
 *
 * Derived by exclusion rather than listed, so a fault added above is
 * disqualifying by default. Getting that default wrong in the other direction —
 * a new fault silently counting against wines until somebody noticed — is the
 * failure worth designing against.
 *
 * Servers own the exclusion; this is published so a seed generator, a backfill
 * and an analytics job cannot each decide it differently.
 */
export const FAULT_CONDITIONS: readonly BottleConditionKey[] = BOTTLE_CONDITIONS.filter(
  (condition) => condition !== "condition.noFaults"
);
