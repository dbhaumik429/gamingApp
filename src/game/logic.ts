import { Board, Match, ScoreResult, Tile, TileKind } from "./types";

const KINDS: TileKind[] = ["aqua", "violet", "amber", "jade", "rose"];

const tileId = (row: number, col: number) => `${row}-${col}`;

const randomKind = () => KINDS[Math.floor(Math.random() * KINDS.length)];

export const createBoard = (size: number): Board => {
  const tiles: Tile[] = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      tiles.push({ id: tileId(row, col), row, col, kind: randomKind() });
    }
  }
  return { size, tiles };
};

const indexFor = (board: Board, row: number, col: number) =>
  board.tiles.findIndex((tile) => tile.row === row && tile.col === col);

const getTile = (board: Board, row: number, col: number) =>
  board.tiles.find((tile) => tile.row === row && tile.col === col) ?? null;

const cloneBoard = (board: Board): Board => ({
  size: board.size,
  tiles: board.tiles.map((tile) => ({ ...tile })),
});

export const swapTiles = {
  canSwap: (first: Tile, second: Tile) => {
    const distance = Math.abs(first.row - second.row) + Math.abs(first.col - second.col);
    return distance === 1;
  },
  apply: (board: Board, first: Tile, second: Tile) => {
    const next = cloneBoard(board);
    const firstIndex = indexFor(next, first.row, first.col);
    const secondIndex = indexFor(next, second.row, second.col);
    if (firstIndex < 0 || secondIndex < 0) {
      return next;
    }
    const temp = next.tiles[firstIndex].kind;
    next.tiles[firstIndex].kind = next.tiles[secondIndex].kind;
    next.tiles[secondIndex].kind = temp;
    return next;
  },
};

export const findMatches = (board: Board): Match[] => {
  const matches: Match[] = [];

  for (let row = 0; row < board.size; row += 1) {
    let streak: Tile[] = [];
    for (let col = 0; col < board.size; col += 1) {
      const tile = getTile(board, row, col);
      if (!tile) continue;
      if (streak.length === 0 || streak[0].kind === tile.kind) {
        streak.push(tile);
      } else {
        if (streak.length >= 3) {
          matches.push({ tileIds: streak.map((t) => t.id), kind: streak[0].kind });
        }
        streak = [tile];
      }
    }
    if (streak.length >= 3) {
      matches.push({ tileIds: streak.map((t) => t.id), kind: streak[0].kind });
    }
  }

  for (let col = 0; col < board.size; col += 1) {
    let streak: Tile[] = [];
    for (let row = 0; row < board.size; row += 1) {
      const tile = getTile(board, row, col);
      if (!tile) continue;
      if (streak.length === 0 || streak[0].kind === tile.kind) {
        streak.push(tile);
      } else {
        if (streak.length >= 3) {
          matches.push({ tileIds: streak.map((t) => t.id), kind: streak[0].kind });
        }
        streak = [tile];
      }
    }
    if (streak.length >= 3) {
      matches.push({ tileIds: streak.map((t) => t.id), kind: streak[0].kind });
    }
  }

  return matches;
};

const applyPrism = (board: Board, match: Match) => {
  if (match.tileIds.length < 4) {
    return;
  }
  const anchorId = match.tileIds[Math.floor(match.tileIds.length / 2)];
  const anchor = board.tiles.find((tile) => tile.id === anchorId);
  if (anchor) {
    anchor.kind = "prism";
  }
};

const clearMatch = (board: Board, match: Match) => {
  match.tileIds.forEach((id) => {
    const tile = board.tiles.find((t) => t.id === id);
    if (tile) {
      tile.kind = randomKind();
    }
  });
};

const clearPrismBursts = (board: Board) => {
  board.tiles.forEach((tile) => {
    if (tile.kind === "prism") {
      const neighbors: Array<[number, number]> = [
        [tile.row - 1, tile.col],
        [tile.row + 1, tile.col],
        [tile.row, tile.col - 1],
        [tile.row, tile.col + 1],
      ];
      neighbors.forEach(([row, col]) => {
        const neighbor = getTile(board, row, col);
        if (neighbor) {
          neighbor.kind = randomKind();
        }
      });
    }
  });
};

export const scoreMatches = (boardInput: Board, matches: Match[]): ScoreResult => {
  if (matches.length === 0) {
    return { total: 0, board: boardInput };
  }
  const board = cloneBoard(boardInput);
  let total = 0;
  matches.forEach((match) => {
    total += match.tileIds.length * 10;
    applyPrism(board, match);
    clearMatch(board, match);
  });
  clearPrismBursts(board);
  return { total, board };
};
