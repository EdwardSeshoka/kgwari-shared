/**
 * Certifications and memberships an estate supplies.
 *
 * A closed set because each is a real body with a real audit — the Old Vine
 * Project, the Cape Winemakers Guild, WIETA. An open string here would let a
 * claimant assert any membership they liked, which is precisely the kind of
 * unattributed fact this record model exists to remove.
 */
export const ESTATE_SEALS = ["oldVineProject", "capeWinemakersGuild", "wieta"] as const;

export type EstateSealKey = (typeof ESTATE_SEALS)[number];
