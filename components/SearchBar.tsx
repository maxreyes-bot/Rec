import { StyleSheet, TextInput, View } from "react-native";
import { theme } from "../constants/theme";

type Props = {
  value: string;
  placeholder?: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
};

export function SearchBar({ value, placeholder, onChangeText, onSubmit }: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        placeholder={placeholder ?? "Search recipes..."}
        placeholderTextColor={theme.colors.textMuted}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  input: {
    color: theme.colors.text,
    fontSize: 16,
  },
});

