const DEFAULT_BASE_URL = "https://www.themealdb.com/api/json/v1/1";

export type MealSummary = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
};

export type MealDetails = MealSummary & {
  strCategory?: string | null;
  strArea?: string | null;
  strInstructions?: string | null;
  strTags?: string | null;
  strYoutube?: string | null;
  // TheMealDB encodes ingredients across strIngredient1..20 & strMeasure1..20
  [key: string]: unknown;
};

type MealsResponse<TMeal> = {
  meals: TMeal[] | null;
};

export type CategoryListItem = {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
};

type CategoriesResponse = {
  categories: CategoryListItem[];
};

function getBaseUrl() {
  // Expo web-safe env var convention.
  const envUrl = process.env.EXPO_PUBLIC_MEALDB_BASE_URL;
  return (envUrl && envUrl.trim()) || DEFAULT_BASE_URL;
}

async function requestJson<T>(path: string): Promise<T> {
  const baseUrl = getBaseUrl().replace(/\/$/, "");
  const url = `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Request failed (${res.status}): ${body || res.statusText}`);
  }

  return (await res.json()) as T;
}

export async function searchMealsByName(query: string): Promise<MealSummary[]> {
  const q = query.trim();
  if (!q) return [];
  const data = await requestJson<MealsResponse<MealSummary>>(
    `/search.php?s=${encodeURIComponent(q)}`
  );
  return data.meals ?? [];
}

export async function filterMealsByIngredient(ingredient: string): Promise<MealSummary[]> {
  const q = ingredient.trim();
  if (!q) return [];
  // Not listed in prompt but supported by TheMealDB and required for "ingredient" search.
  const data = await requestJson<MealsResponse<MealSummary>>(
    `/filter.php?i=${encodeURIComponent(q)}`
  );
  return data.meals ?? [];
}

export async function lookupMealById(id: string): Promise<MealDetails | null> {
  const data = await requestJson<MealsResponse<MealDetails>>(
    `/lookup.php?i=${encodeURIComponent(id)}`
  );
  return data.meals?.[0] ?? null;
}

export async function listCategories(): Promise<CategoryListItem[]> {
  const data = await requestJson<CategoriesResponse>(`/categories.php`);
  return data.categories ?? [];
}

export async function filterMealsByCategory(category: string): Promise<MealSummary[]> {
  const c = category.trim();
  if (!c) return [];
  const data = await requestJson<MealsResponse<MealSummary>>(
    `/filter.php?c=${encodeURIComponent(c)}`
  );
  return data.meals ?? [];
}

export async function getRandomMeal(): Promise<MealDetails | null> {
  // Not listed in prompt but supported by TheMealDB; used for "Featured" on Home.
  const data = await requestJson<MealsResponse<MealDetails>>(`/random.php`);
  return data.meals?.[0] ?? null;
}

export function extractIngredients(meal: MealDetails): Array<{ ingredient: string; measure: string }> {
  const items: Array<{ ingredient: string; measure: string }> = [];

  for (let i = 1; i <= 20; i++) {
    const ing = String(meal[`strIngredient${i}`] ?? "").trim();
    const meas = String(meal[`strMeasure${i}`] ?? "").trim();
    if (!ing) continue;
    items.push({ ingredient: ing, measure: meas });
  }

  return items;
}

