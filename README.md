# Recipe Finder (Expo + React Native + Expo Router)

Cross-platform recipe app (iOS/Android/Web) powered by **TheMealDB**.

## Features

- Home with **Featured** random recipe + **Category filtering**
- Search by **dish name** or **ingredient**
- Recipe details: image, ingredients list, instructions, YouTube link (when available)
- Loading + error states
- Web-safe environment variables (`EXPO_PUBLIC_*`) for Vercel compatibility

## Tech

- Expo + React Native
- TypeScript
- Expo Router
- Data fetching via `fetch`

## Setup

```bash
npm install
npx expo start
```

Run web:

```bash
npm run web
```

Static export for Vercel:

```bash
npm run export:web
```

## Environment variables (optional)

By default the app uses TheMealDB base URL:

- `https://www.themealdb.com/api/json/v1/1/`

Override it if needed:

```bash
EXPO_PUBLIC_MEALDB_BASE_URL=https://www.themealdb.com/api/json/v1/1
```

## API response handling notes

TheMealDB returns:

- Search results under `meals` (or `null` when there are no matches)
- Ingredients across `strIngredient1..20` and `strMeasure1..20`

This app normalizes that into an ingredients array in `services/recipesApi.ts`.

