/**
 * Who may come. A closed set, rendered as chrome.
 *
 *  - `open`     Anyone, no ticket.
 *  - `ticketed` Anyone who buys a seat.
 *  - `trade`    The trade only — sommeliers, buyers, press.
 *  - `club`     Members of the host's own list.
 */
export type EventAdmissionContract = "open" | "ticketed" | "trade" | "club";
