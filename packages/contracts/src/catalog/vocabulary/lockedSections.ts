/**
 * Sections a claim has not bought yet.
 *
 * One today, and typed as a set anyway: the point of the record model is that
 * what is missing is NAMED rather than counted, so a second locked section is a
 * product decision that should be visible here rather than a new string.
 */
export const LOCKED_SECTIONS = ["estateVoice"] as const;

export type LockedSectionKey = (typeof LOCKED_SECTIONS)[number];

export function lockedSectionTitleKey(section: LockedSectionKey): string {
  return `record.locked.${section}.title`;
}

/**
 * The body differs by WHO holds the claim, which is the asymmetry the page
 * exists to make legible: on a community record the estate has simply not
 * spoken, while on a distributor-claimed one somebody accountable has arrived
 * and still cannot answer.
 */
export function lockedSectionBodyKey(
  section: LockedSectionKey,
  claimant?: "distributor"
): string {
  return claimant === "distributor"
    ? `record.locked.${section}.distributorBody`
    : `record.locked.${section}.body`;
}
