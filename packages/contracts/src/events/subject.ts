/**
 * What an event is *about* — events are not wines, but they link to one when
 * relevant (a producer tasting → their label; a masterclass → a grape/style).
 */
export type EventSubjectContract =
  | { kind: "wine"; wineVintageId: string }
  | { kind: "wine_label"; wineLabelId: string }
  | { kind: "producer"; producerId: string }
  | { kind: "region"; regionId: string }
  | { kind: "grape"; grapeVarietyId: string }
  | { kind: "style"; styleName: string };
