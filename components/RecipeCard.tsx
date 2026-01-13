import { Link } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../constants/theme";
import type { MealSummary } from "../services/recipesApi";

type Props = {
  meal: MealSummary;
  subtitle?: string;
};

export function RecipeCard({ meal, subtitle }: Props) {
  return (
    <Link href={{ pathname: "/recipe/[id]", params: { id: meal.idMeal } }} asChild>
      <Pressable style={styles.card}>
        <Image source={{ uri: meal.strMealThumb }} style={styles.image} />
        <View style={styles.content}>
          <Text numberOfLines={2} style={styles.title}>
            {meal.strMeal}
          </Text>
          {!!subtitle && (
            <Text numberOfLines={1} style={styles.subtitle}>
              {subtitle}
            </Text>
          )}
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 140,
    backgroundColor: theme.colors.border,
  },
  content: {
    padding: theme.spacing.md,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
});

