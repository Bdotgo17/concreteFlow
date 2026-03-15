import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useApp, type JobStatus } from "@/context/AppContext";
import JobCard from "@/components/JobCard";
import EmptyState from "@/components/EmptyState";

type FilterTab = JobStatus | "all";

const FILTER_TABS: { label: string; value: FilterTab }[] = [
  { label: "All", value: "all" },
  { label: "Saved", value: "saved" },
  { label: "Applied", value: "applied" },
  { label: "Screening", value: "screening" },
  { label: "Interview", value: "interview" },
  { label: "Offer", value: "offer" },
  { label: "Rejected", value: "rejected" },
];

export default function JobsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { jobs } = useApp();
  const params = useLocalSearchParams<{ filter?: string }>();
  const [activeFilter, setActiveFilter] = useState<FilterTab>(
    (params.filter as FilterTab) ?? "all"
  );

  const filtered = useMemo(
    () =>
      activeFilter === "all"
        ? jobs
        : jobs.filter((j) => j.status === activeFilter),
    [jobs, activeFilter]
  );

  const sorted = useMemo(
    () =>
      [...filtered].sort(
        (a, b) =>
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      ),
    [filtered]
  );

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 16,
            backgroundColor: C.background,
            borderBottomColor: C.border,
          },
        ]}
      >
        <View style={styles.titleRow}>
          <Text style={[styles.headerTitle, { color: C.text }]}>
            My Applications
          </Text>
          <Pressable
            style={[styles.addBtn, { backgroundColor: C.tint }]}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/add-job");
            }}
          >
            <Feather name="plus" size={18} color="#fff" />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTER_TABS.map((tab) => {
            const count =
              tab.value === "all"
                ? jobs.length
                : jobs.filter((j) => j.status === tab.value).length;
            const isActive = activeFilter === tab.value;
            return (
              <Pressable
                key={tab.value}
                style={[
                  styles.filterTab,
                  {
                    backgroundColor: isActive
                      ? C.tint
                      : isDark
                      ? C.surfaceSecondary
                      : "#F3F4F6",
                  },
                ]}
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.selectionAsync();
                  setActiveFilter(tab.value);
                }}
              >
                <Text
                  style={[
                    styles.filterLabel,
                    { color: isActive ? "#fff" : C.textSecondary },
                  ]}
                >
                  {tab.label}
                </Text>
                {count > 0 && (
                  <View
                    style={[
                      styles.filterCount,
                      {
                        backgroundColor: isActive
                          ? "rgba(255,255,255,0.25)"
                          : C.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterCountText,
                        { color: isActive ? "#fff" : C.textTertiary },
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <JobCard job={item} />}
        contentContainerStyle={[
          styles.list,
          sorted.length === 0 && styles.listEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        ListEmptyComponent={
          <EmptyState
            icon="briefcase"
            title={
              activeFilter === "all"
                ? "No applications yet"
                : `No ${activeFilter} jobs`
            }
            subtitle={
              activeFilter === "all"
                ? "Tap the + button to add your first job application"
                : "Try a different filter to see your jobs"
            }
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  filterRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  filterLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  filterCount: {
    borderRadius: 10,
    minWidth: 20,
    paddingHorizontal: 5,
    paddingVertical: 1,
    alignItems: "center",
  },
  filterCountText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  list: {
    paddingTop: 8,
    paddingBottom: 120,
  },
  listEmpty: {
    flex: 1,
  },
});
