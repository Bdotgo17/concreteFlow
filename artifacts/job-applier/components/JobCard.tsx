import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import Colors from "@/constants/colors";
import type { Job, JobStatus } from "@/context/AppContext";

const STATUS_CONFIG: Record<
  JobStatus,
  { label: string; color: string; bg: string; darkColor: string; darkBg: string }
> = {
  saved: {
    label: "Saved",
    color: "#6B7280",
    bg: "#F3F4F6",
    darkColor: "#9CA3AF",
    darkBg: "#1F2937",
  },
  applied: {
    label: "Applied",
    color: "#1B4FFF",
    bg: "#EEF3FF",
    darkColor: "#4F7FFF",
    darkBg: "#0C1A3F",
  },
  screening: {
    label: "Screening",
    color: "#7C3AED",
    bg: "#F3EFFE",
    darkColor: "#A78BFA",
    darkBg: "#1A0F35",
  },
  interview: {
    label: "Interview",
    color: "#D97706",
    bg: "#FFFBEB",
    darkColor: "#FBBF24",
    darkBg: "#1C1107",
  },
  offer: {
    label: "Offer",
    color: "#059669",
    bg: "#ECFDF5",
    darkColor: "#34D399",
    darkBg: "#052E16",
  },
  rejected: {
    label: "Rejected",
    color: "#DC2626",
    bg: "#FEF2F2",
    darkColor: "#F87171",
    darkBg: "#1F0000",
  },
  withdrawn: {
    label: "Withdrawn",
    color: "#6B7280",
    bg: "#F9FAFB",
    darkColor: "#9CA3AF",
    darkBg: "#111827",
  },
};

const JOB_TYPE_LABELS: Record<Job["jobType"], string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  remote: "Remote",
  hybrid: "Hybrid",
};

function getTimeAgo(isoDate: string) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

interface JobCardProps {
  job: Job;
  compact?: boolean;
}

export default function JobCard({ job, compact = false }: JobCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const statusConfig = STATUS_CONFIG[job.status];

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    router.push({ pathname: "/job/[id]", params: { id: job.id } });
  };

  const initials = job.company
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: C.surface,
          borderColor: C.border,
          shadowColor: C.cardShadow,
          opacity: pressed ? 0.95 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
      ]}
    >
      <View style={styles.topRow}>
        <View
          style={[
            styles.logo,
            { backgroundColor: job.logoColor ?? C.tint },
          ]}
        >
          <Text style={styles.logoText}>{initials}</Text>
        </View>

        <View style={styles.titleBlock}>
          <Text
            style={[styles.jobTitle, { color: C.text }]}
            numberOfLines={1}
          >
            {job.title}
          </Text>
          <Text
            style={[styles.company, { color: C.textSecondary }]}
            numberOfLines={1}
          >
            {job.company}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isDark
                ? statusConfig.darkBg
                : statusConfig.bg,
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color: isDark
                  ? statusConfig.darkColor
                  : statusConfig.color,
              },
            ]}
          >
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {!compact && (
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Feather name="map-pin" size={12} color={C.textTertiary} />
            <Text
              style={[styles.metaText, { color: C.textSecondary }]}
              numberOfLines={1}
            >
              {job.location}
            </Text>
          </View>
          <View style={styles.metaDot} />
          <View style={styles.metaItem}>
            <Feather name="briefcase" size={12} color={C.textTertiary} />
            <Text style={[styles.metaText, { color: C.textSecondary }]}>
              {JOB_TYPE_LABELS[job.jobType]}
            </Text>
          </View>
          {job.salary && (
            <>
              <View style={styles.metaDot} />
              <View style={styles.metaItem}>
                <Feather name="dollar-sign" size={12} color={C.textTertiary} />
                <Text
                  style={[styles.metaText, { color: C.textSecondary }]}
                  numberOfLines={1}
                >
                  {job.salary}
                </Text>
              </View>
            </>
          )}
        </View>
      )}

      <View style={styles.bottomRow}>
        <Text style={[styles.timeAgo, { color: C.textTertiary }]}>
          {getTimeAgo(job.lastUpdated)}
        </Text>
        <Feather name="chevron-right" size={16} color={C.textTertiary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  jobTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  company: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 10,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#D1D5DB",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  timeAgo: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
