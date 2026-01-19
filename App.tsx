import { StatusBar } from "expo-status-bar";
import React, { useCallback, useMemo, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  createBoard,
  findMatches,
  scoreMatches,
  swapTiles,
} from "./src/game/logic";
import { Board, Tile, TileKind } from "./src/game/types";

const BOARD_SIZE = 8;
const ROUND_SECONDS = 75;

const COLORS: Record<TileKind, string> = {
  aqua: "#5CE1E6",
  violet: "#8B5CF6",
  amber: "#FACC15",
  jade: "#34D399",
  rose: "#FB7185",
  prism: "#F9A8D4",
};

export default function App() {
  const [board, setBoard] = useState<Board>(() => createBoard(BOARD_SIZE));
  const [selected, setSelected] = useState<Tile | null>(null);
  const [score, setScore] = useState(0);

  const remaining = useMemo(() => ROUND_SECONDS, []);

  const onSelect = useCallback(
    (tile: Tile) => {
      if (!selected) {
        setSelected(tile);
        return;
      }

      if (selected.id === tile.id) {
        setSelected(null);
        return;
      }

      if (!swapTiles.canSwap(selected, tile)) {
        setSelected(tile);
        return;
      }

      const next = swapTiles.apply(board, selected, tile);
      const matches = findMatches(next);
      if (matches.length === 0) {
        setSelected(null);
        return;
      }

      const scored = scoreMatches(next, matches);
      setScore((prev) => prev + scored.total);
      setBoard(scored.board);
      setSelected(null);
    },
    [board, selected]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Prism Pop</Text>
          <Text style={styles.subtitle}>
            Match 3+ crystals · {remaining}s round
          </Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
      </View>

      <View style={styles.board}>
        {board.tiles.map((tile) => {
          const isSelected = selected?.id === tile.id;
          return (
            <TouchableOpacity
              key={tile.id}
              onPress={() => onSelect(tile)}
              style={[
                styles.tile,
                { backgroundColor: COLORS[tile.kind] },
                isSelected && styles.selectedTile,
                tile.kind === "prism" && styles.prismTile,
              ]}
            >
              <Text style={styles.tileText}>
                {tile.kind === "prism" ? "✶" : ""}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerTitle}>Prism Twist</Text>
        <Text style={styles.footerBody}>
          Chain a 4+ match to spawn a prism tile. Prism tiles refract into
          multi-direction clears on the next match.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0E1A",
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 12,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    color: "#EDE9FE",
    fontWeight: "700",
  },
  subtitle: {
    color: "#9CA3AF",
    marginTop: 4,
    fontSize: 13,
  },
  scoreBox: {
    backgroundColor: "#141A2B",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2E3655",
  },
  scoreLabel: {
    color: "#94A3B8",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  scoreValue: {
    color: "#F8FAFC",
    fontSize: 20,
    fontWeight: "600",
  },
  board: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignSelf: "center",
    padding: 12,
    backgroundColor: "#11162A",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#222B45",
  },
  tile: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6EE7FF",
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  selectedTile: {
    borderColor: "#F8FAFC",
    borderWidth: 2,
  },
  prismTile: {
    borderColor: "#FCE7F3",
    shadowColor: "#F9A8D4",
    shadowOpacity: 0.65,
  },
  tileText: {
    color: "#0B0E1A",
    fontWeight: "700",
  },
  footer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#121A33",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#27335A",
  },
  footerTitle: {
    color: "#E0E7FF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  footerBody: {
    color: "#9CA3AF",
    lineHeight: 20,
    fontSize: 13,
  },
});
