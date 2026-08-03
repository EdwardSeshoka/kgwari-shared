/**
 * Every lens narrows FROM somewhere, and `lens.all` is that somewhere.
 *
 * Its own constant because two rules key off it and both are about what NOT to
 * draw: a row that would render `lens.all` on its own is not rendered at all —
 * a lone "All" narrows nothing and is a control that cannot be used — and a list
 * always opens on it.
 */
export const LENS_ALL = "lens.all";
