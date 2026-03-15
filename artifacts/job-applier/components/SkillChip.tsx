import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, useColorScheme } from "react-native";
import Colors from "@/constants/colors";

interface SkillChipProps {
  label: string;
  removable?: boolean;
  onRemove?: () => void;
}

export default function SkillChip({ label, removable, onRemove }: SkillChipProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;

  return (
    <Pressable
      style={[
        styles.chip,
        { backgroundColor: isDark ? "#0C1A3F" : "#EEF3FF", borderColor: isDark ? "#1B4FFF33" : "#1B4FFF22" },
      ]}
      onPress={removable ? onRemove : undefined}
    >
      <Text style={[styles.label, { color: C.tint }]}>{label}</Text>
      {removable && (
        <Feather name="x" size={12} color={C.tint} style={styles.icon} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  icon: {
    marginLeft: 4,
  },
});
