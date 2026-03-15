import React from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import Colors from "@/constants/colors";

interface StatCardProps {
  value: number | string;
  label: string;
  color?: string;
  bgColor?: string;
}

export default function StatCard({
  value,
  label,
  color,
  bgColor,
}: StatCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: bgColor ?? C.surface,
          borderColor: C.border,
          shadowColor: C.cardShadow,
        },
      ]}
    >
      <Text style={[styles.value, { color: color ?? C.tint }]}>{value}</Text>
      <Text style={[styles.label, { color: C.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
    minWidth: 80,
  },
  value: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    lineHeight: 34,
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    marginTop: 4,
    textAlign: "center",
  },
});
