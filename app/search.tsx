import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Loader } from "../components/Loader";
import { RecipeCard } from "../components/RecipeCard";
import { SearchBar } from "../components/SearchBar";
import { theme } from "../constants/theme";
import type { MealSummary } from "../services/recipesApi";
import { filterMealsByIngredient, searchMealsByName } from "../services/recipesApi";

type SearchMode = "name" | "ingredient";

export default function SearchScreen() {
  const [mode, setMode] = useState<SearchMode>("name");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MealSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placeholder = useMemo(() => {
    return mode === "name" ? "Search by dish name (e.g., Arrabiata)" : "Search by ingredient (e.g., chicken)";
  }, [mode]);

  async function runSearch() {
    const q = query.trim();
    setError(null);
    setLoading(true);
    try {
      const items =
        mode === "name" ? await searchMealsByName(q) : await filterMealsByIngredient(q);
      setResults(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.modeRow}>
          <Pressable
            onPress={() => setMode("name")}
            style={[styles.modeButton, mode === "name" && styles.modeButtonActive]}
          >
            <Text style={[styles.modeText, mode === "name" && styles.modeTextActive]}>Name</Text>
          </Pressable>
          <Pressable
            onPress={() => setMode("ingredient")}
            style={[styles.modeButton, mode === "ingredient" && styles.modeButtonActive]}
          >
            <Text
              style={[styles.modeText, mode === "ingredient" && styles.modeTextActive]}
            >
              Ingredient
            </Text>
          </Pressable>
        </View>

        <SearchBar value={query} onChangeText={setQuery} onSubmit={() => void runSearch()} placeholder={placeholder} />

        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {loading ? (
          <Loader />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.idMeal}
            renderItem={({ item }) => <RecipeCard meal={item} subtitle={mode === "name" ? "Result" : "Matches ingredient"} />}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={{ height: theme.spacing.md }} />}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>Search recipes</Text>
                <Text style={styles.emptyText}>
                  Try a dish name like “Arrabiata” or switch to ingredient search like “chicken”.
                </Text>
                <Pressable onPress={() => void runSearch()} style={styles.cta}>
                  <Text style={styles.ctaText}>Search</Text>
                </Pressable>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, padding: theme.spacing.lg, gap: theme.spacing.md },
  modeRow: { flexDirection: "row", gap: theme.spacing.sm },
  modeButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    alignItems: "center",
  },
  modeButtonActive: {
    backgroundColor: "#EEE8FF",
    borderColor: theme.colors.primary,
  },
  modeText: { fontWeight: "800", color: theme.colors.textMuted },
  modeTextActive: { color: theme.colors.primary },
  list: { paddingTop: theme.spacing.sm, paddingBottom: theme.spacing.xl },
  empty: {
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: theme.colors.text },
  emptyText: { color: theme.colors.textMuted, lineHeight: 20 },
  cta: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  ctaText: { color: "#fff", fontWeight: "800" },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  errorText: { color: theme.colors.danger, fontWeight: "600" },
});

