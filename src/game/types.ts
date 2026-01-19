export type TileKind = "aqua" | "violet" | "amber" | "jade" | "rose" | "prism";

export type Tile = {
  id: string;
  row: number;
  col: number;
  kind: TileKind;
};

export type Board = {
  size: number;
  tiles: Tile[];
};

export type Match = {
  tileIds: string[];
  kind: TileKind;
};

export type ScoreResult = {
  total: number;
  board: Board;
};
