import { int } from "../random.mjs";
import { PEOPLE, slug } from "../data.mjs";

/** The members. Every one gets an activity later, or its search row would dangle. */
export function buildPeople() {
  const users = PEOPLE.map(([displayName, status, role]) => ({
    id: `user_${slug(displayName)}`,
    displayName,
    initials: displayName.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
    ...(status ? { status } : {}),
    ...(role ? { tier: "professional", role } : {}),
    noteCount: int(1, 320),
  }));

  return users;
}
