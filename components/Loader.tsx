import { ActivityIndicator, StyleSheet, View } from "react-native";
import { theme } from "../constants/theme";

export function Loader() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
});

