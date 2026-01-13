import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Image, Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Loader } from "../../components/Loader";
import { theme } from "../../constants/theme";
import type { MealDetails } from "../../services/recipesApi";
import { extractIngredients, lookupMealById } from "../../services/recipesApi";

export default function RecipeDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = String(params.id || "");

  const [meal, setMeal] = useState<MealDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ingredients = useMemo(() => (meal ? extractIngredients(meal) : []), [meal]);

  useEffect(() => {
    async function run() {
      setError(null);
      setLoading(true);
      try {
        const m = await lookupMealById(id);
        setMeal(m);
        if (!m) setError("Recipe not found.");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load recipe.");
      } finally {
        setLoading(false);
      }
    }

    void run();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <Loader />
      </SafeAreaView>
    );
  }

  if (!meal) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Unable to load recipe</Text>
          <Text style={styles.errorText}>{error ?? "Unknown error."}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const meta = [meal.strCategory, meal.strArea].filter(Boolean).join(" • ");
  const prepTime = "N/A"; // TheMealDB does not provide prep time.

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={{ uri: meal.strMealThumb }} style={styles.hero} />

        <View style={styles.card}>
          <Text style={styles.title}>{meal.strMeal}</Text>
          {!!meta && <Text style={styles.meta}>{meta}</Text>}

          <View style={styles.metaRow}>
            <View style={styles.pill}>
              <Text style={styles.pillLabel}>Prep time</Text>
              <Text style={styles.pillValue}>{prepTime}</Text>
            </View>
            {!!meal.strTags && (
              <View style={styles.pill}>
                <Text style={styles.pillLabel}>Tags</Text>
                <Text numberOfLines={1} style={styles.pillValue}>
                  {meal.strTags}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {ingredients.length ? (
            <View style={styles.ingredients}>
              {ingredients.map((it) => (
                <View key={`${it.ingredient}-${it.measure}`} style={styles.ingredientRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.ingredientText}>
                    <Text style={{ fontWeight: "800" }}>{it.ingredient}</Text>
                    {it.measure ? ` — ${it.measure}` : ""}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.muted}>No ingredients listed.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <Text style={styles.instructions}>{meal.strInstructions || "No instructions available."}</Text>

          {!!meal.strYoutube && (
            <Pressable
              onPress={() => void Linking.openURL(String(meal.strYoutube))}
              style={styles.youtube}
            >
              <Text style={styles.youtubeText}>Watch on YouTube</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  container: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  hero: {
    width: "100%",
    height: 240,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.border,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  title: { fontSize: 22, fontWeight: "900", color: theme.colors.text },
  meta: { color: theme.colors.textMuted, fontWeight: "700" },
  metaRow: { flexDirection: "row", gap: theme.spacing.sm, flexWrap: "wrap", marginTop: theme.spacing.sm },
  pill: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "#F9FAFB",
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minWidth: 120,
    gap: 2,
  },
  pillLabel: { fontSize: 12, color: theme.colors.textMuted, fontWeight: "700" },
  pillValue: { fontSize: 14, color: theme.colors.text, fontWeight: "800" },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: theme.colors.text },
  ingredients: { gap: 10, marginTop: theme.spacing.sm },
  ingredientRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  bullet: { color: theme.colors.primary, fontWeight: "900", marginTop: 1 },
  ingredientText: { flex: 1, color: theme.colors.text, lineHeight: 20 },
  muted: { color: theme.colors.textMuted },
  instructions: { color: theme.colors.text, lineHeight: 22 },
  youtube: {
    marginTop: theme.spacing.md,
    alignSelf: "flex-start",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  youtubeText: { color: "#fff", fontWeight: "900" },
  errorBox: {
    margin: theme.spacing.lg,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.sm,
  },
  errorTitle: { fontSize: 18, fontWeight: "900", color: theme.colors.danger },
  errorText: { color: theme.colors.danger, fontWeight: "600" },
});

