import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useApp, type JobStatus } from "@/context/AppContext";

const STATUS_OPTIONS: { value: JobStatus; label: string; color: string }[] = [
  { value: "saved", label: "Saved", color: "#6B7280" },
  { value: "applied", label: "Applied", color: "#1B4FFF" },
  { value: "screening", label: "Screening", color: "#7C3AED" },
  { value: "interview", label: "Interview", color: "#D97706" },
  { value: "offer", label: "Offer", color: "#059669" },
  { value: "rejected", label: "Rejected", color: "#DC2626" },
  { value: "withdrawn", label: "Withdrawn", color: "#6B7280" },
];

const JOB_TYPE_LABELS: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  remote: "Remote",
  hybrid: "Hybrid",
};

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function JobDetailScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { jobs, updateJob, deleteJob } = useApp();
  const job = jobs.find((j) => j.id === id);
  const [notes, setNotes] = useState(job?.notes ?? "");
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  if (!job) {
    return (
      <View style={[styles.container, { backgroundColor: C.background }]}>
        <Text style={{ color: C.text, padding: 20 }}>Job not found</Text>
      </View>
    );
  }

  const initials = job.company
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === job.status);

  const handleStatusChange = (status: JobStatus) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateJob(job.id, {
      status,
      ...(status === "applied" && !job.appliedDate
        ? { appliedDate: new Date().toISOString() }
        : {}),
    });
    setShowStatusPicker(false);
  };

  const handleSaveNotes = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateJob(job.id, { notes });
  };

  const handleDelete = () => {
    if (Platform.OS === "web") {
      deleteJob(job.id);
      router.back();
      return;
    }
    Alert.alert("Delete Job", "Remove this application from your tracker?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteJob(job.id);
          router.back();
        },
      },
    ]);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 8,
            backgroundColor: C.background,
            borderBottomColor: C.border,
          },
        ]}
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: C.text }]} numberOfLines={1}>
          Job Detail
        </Text>
        <Pressable onPress={handleDelete}>
          <Feather name="trash-2" size={20} color={C.error} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: 40 + insets.bottom }]}
      >
        <View style={styles.hero}>
          <View style={[styles.logo, { backgroundColor: job.logoColor ?? C.tint }]}>
            <Text style={styles.logoText}>{initials}</Text>
          </View>
          <View style={styles.heroInfo}>
            <Text style={[styles.jobTitle, { color: C.text }]}>{job.title}</Text>
            <Text style={[styles.company, { color: C.textSecondary }]}>
              {job.company}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={[styles.metaChip, { backgroundColor: isDark ? C.surfaceSecondary : "#F3F4F6" }]}>
            <Feather name="map-pin" size={12} color={C.textTertiary} />
            <Text style={[styles.metaChipText, { color: C.textSecondary }]}>
              {job.location}
            </Text>
          </View>
          <View style={[styles.metaChip, { backgroundColor: isDark ? C.surfaceSecondary : "#F3F4F6" }]}>
            <Feather name="briefcase" size={12} color={C.textTertiary} />
            <Text style={[styles.metaChipText, { color: C.textSecondary }]}>
              {JOB_TYPE_LABELS[job.jobType] ?? job.jobType}
            </Text>
          </View>
          {job.salary && (
            <View style={[styles.metaChip, { backgroundColor: isDark ? "#052E16" : "#ECFDF5" }]}>
              <Feather name="dollar-sign" size={12} color={C.success} />
              <Text style={[styles.metaChipText, { color: C.success }]}>
                {job.salary}
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[styles.cardTitle, { color: C.text }]}>Application Status</Text>
          <Pressable
            style={[
              styles.statusSelector,
              { backgroundColor: isDark ? C.surfaceSecondary : "#F9FAFB", borderColor: C.border },
            ]}
            onPress={() => setShowStatusPicker(!showStatusPicker)}
          >
            <View style={[styles.statusDot, { backgroundColor: currentStatus?.color }]} />
            <Text style={[styles.statusText, { color: C.text }]}>
              {currentStatus?.label}
            </Text>
            <Feather
              name={showStatusPicker ? "chevron-up" : "chevron-down"}
              size={16}
              color={C.textTertiary}
            />
          </Pressable>

          {showStatusPicker && (
            <View style={[styles.statusDropdown, { backgroundColor: C.surface, borderColor: C.border }]}>
              {STATUS_OPTIONS.map((s) => (
                <Pressable
                  key={s.value}
                  style={[
                    styles.statusOption,
                    {
                      backgroundColor:
                        job.status === s.value
                          ? isDark
                            ? "#0C1A3F"
                            : "#EEF3FF"
                          : "transparent",
                    },
                  ]}
                  onPress={() => handleStatusChange(s.value)}
                >
                  <View style={[styles.statusDot, { backgroundColor: s.color }]} />
                  <Text style={[styles.statusOptionText, { color: C.text }]}>
                    {s.label}
                  </Text>
                  {job.status === s.value && (
                    <Feather name="check" size={16} color={C.tint} />
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[styles.cardTitle, { color: C.text }]}>Timeline</Text>
          <View style={styles.timelineRow}>
            <Feather name="calendar" size={14} color={C.textTertiary} />
            <Text style={[styles.timelineLabel, { color: C.textSecondary }]}>
              Applied:
            </Text>
            <Text style={[styles.timelineValue, { color: C.text }]}>
              {formatDate(job.appliedDate)}
            </Text>
          </View>
          <View style={styles.timelineRow}>
            <Feather name="clock" size={14} color={C.textTertiary} />
            <Text style={[styles.timelineLabel, { color: C.textSecondary }]}>
              Last updated:
            </Text>
            <Text style={[styles.timelineValue, { color: C.text }]}>
              {formatDate(job.lastUpdated)}
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[styles.cardTitle, { color: C.text }]}>Notes</Text>
          <TextInput
            style={[
              styles.notesInput,
              {
                color: C.text,
                borderColor: C.border,
                backgroundColor: isDark ? C.surfaceSecondary : "#F9FAFB",
              },
            ]}
            placeholder="Add notes, interview prep, follow-ups..."
            placeholderTextColor={C.textTertiary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          <Pressable
            style={[styles.saveBtn, { backgroundColor: C.tint }]}
            onPress={handleSaveNotes}
          >
            <Text style={styles.saveBtnText}>Save Notes</Text>
          </Pressable>
        </View>

        {job.tags && job.tags.length > 0 && (
          <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Text style={[styles.cardTitle, { color: C.text }]}>Skills</Text>
            <View style={styles.tagsWrap}>
              {job.tags.map((tag) => (
                <View
                  key={tag}
                  style={[styles.tag, { backgroundColor: isDark ? "#0C1A3F" : "#EEF3FF" }]}
                >
                  <Text style={[styles.tagText, { color: C.tint }]}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {job.url && (
          <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Text style={[styles.cardTitle, { color: C.text }]}>Job Link</Text>
            <Text style={[styles.urlText, { color: C.tint }]} numberOfLines={2}>
              {job.url}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  scroll: { padding: 16, gap: 12 },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 4,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  heroInfo: { flex: 1, gap: 4 },
  jobTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  company: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  metaChipText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  statusSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  statusDropdown: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
  },
  statusOptionText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timelineLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    width: 90,
  },
  timelineValue: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  notesInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 120,
  },
  saveBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  urlText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
});
