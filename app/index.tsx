import { Link } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Loader } from "../components/Loader";
import { RecipeCard } from "../components/RecipeCard";
import { theme } from "../constants/theme";
import type { CategoryListItem, MealDetails, MealSummary } from "../services/recipesApi";
import { filterMealsByCategory, getRandomMeal, listCategories } from "../services/recipesApi";

export default function HomeScreen() {
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Beef");
  const [meals, setMeals] = useState<MealSummary[]>([]);
  const [featured, setFeatured] = useState<MealDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryChips = useMemo(
    () => categories.map((c) => c.strCategory),
    [categories]
  );

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const [cats, random] = await Promise.all([listCategories(), getRandomMeal()]);
      setCategories(cats);
      setFeatured(random);

      // Ensure selected category is valid.
      const initial =
        cats.find((c) => c.strCategory === selectedCategory)?.strCategory ??
        cats[0]?.strCategory ??
        selectedCategory;
      setSelectedCategory(initial);

      const items = await filterMealsByCategory(initial);
      setMeals(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function loadCategory(category: string) {
    setError(null);
    setSelectedCategory(category);
    try {
      const items = await filterMealsByCategory(category);
      setMeals(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load recipes.");
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <Loader />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.topRow}>
              <Text style={styles.h1}>Find your next meal</Text>
              <Link href="/search" asChild>
                <Pressable style={styles.searchButton}>
                  <Text style={styles.searchButtonText}>Search</Text>
                </Pressable>
              </Link>
            </View>

            {!!featured && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Featured</Text>
                <RecipeCard
                  meal={featured}
                  subtitle={[featured.strCategory, featured.strArea].filter(Boolean).join(" • ")}
                />
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipsRow}>
                  {(categoryChips.length ? categoryChips : [selectedCategory]).map((c) => {
                    const active = c === selectedCategory;
                    return (
                      <Pressable
                        key={c}
                        onPress={() => void loadCategory(c)}
                        style={[styles.chip, active && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{selectedCategory} picks</Text>
              <Pressable
                onPress={() => void load()}
                accessibilityLabel="Refresh recipes"
                style={styles.linkButton}
              >
                <Text style={styles.linkButtonText}>Refresh</Text>
              </Pressable>
            </View>

            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>
        }
        data={meals}
        keyExtractor={(item) => item.idMeal}
        renderItem={({ item }) => <RecipeCard meal={item} subtitle={selectedCategory} />}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: theme.spacing.md }} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void load().finally(() => setRefreshing(false));
            }}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  list: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  header: { gap: theme.spacing.lg },
  topRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.md },
  h1: { flex: 1, fontSize: 22, fontWeight: "800", color: theme.colors.text },
  searchButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  searchButtonText: { color: "#fff", fontWeight: "700" },
  section: { gap: theme.spacing.sm },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: theme.colors.text },
  chipsRow: { flexDirection: "row", gap: theme.spacing.sm },
  chip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 999,
  },
  chipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: "#EEE8FF",
  },
  chipText: { color: theme.colors.textMuted, fontWeight: "700" },
  chipTextActive: { color: theme.colors.primary },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  linkButton: { paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs },
  linkButtonText: { color: theme.colors.primary, fontWeight: "800" },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  errorText: { color: theme.colors.danger, fontWeight: "600" },
});

