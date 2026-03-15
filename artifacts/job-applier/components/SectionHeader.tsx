import React from "react";
import { Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";
import Colors from "@/constants/colors";

interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
}

export default function SectionHeader({ title, action, onAction }: SectionHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: C.text }]}>{title}</Text>
      {action && onAction && (
        <Pressable onPress={onAction}>
          <Text style={[styles.action, { color: C.tint }]}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  action: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});
