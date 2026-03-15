import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
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
import StatCard from "@/components/StatCard";
import SectionHeader from "@/components/SectionHeader";

const STATUS_ORDER: JobStatus[] = [
  "applied",
  "screening",
  "interview",
  "offer",
  "saved",
  "rejected",
];

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { jobs, profile } = useApp();

  const stats = useMemo(() => {
    const applied = jobs.filter((j) => j.status !== "saved").length;
    const interviews = jobs.filter((j) => j.status === "interview").length;
    const offers = jobs.filter((j) => j.status === "offer").length;
    const rate =
      applied > 0 ? Math.round((interviews / applied) * 100) : 0;
    return { applied, interviews, offers, rate };
  }, [jobs]);

  const recentJobs = useMemo(
    () =>
      [...jobs]
        .sort(
          (a, b) =>
            new Date(b.lastUpdated).getTime() -
            new Date(a.lastUpdated).getTime()
        )
        .slice(0, 4),
    [jobs]
  );

  const pipeline = useMemo(() => {
    return STATUS_ORDER.map((status) => ({
      status,
      count: jobs.filter((j) => j.status === status).length,
    })).filter((s) => s.count > 0);
  }, [jobs]);

  const handleAddJob = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/add-job");
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <LinearGradient
        colors={
          isDark
            ? ["#0C1A3F", "#080E1A"]
            : ["#EEF3FF", C.background]
        }
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.greeting, { color: C.textSecondary }]}>
              Good morning
            </Text>
            <Text style={[styles.name, { color: C.text }]}>
              {profile.name || "Job Seeker"} 👋
            </Text>
          </View>
          <Pressable
            style={[styles.addBtn, { backgroundColor: C.tint }]}
            onPress={handleAddJob}
          >
            <Feather name="plus" size={20} color="#fff" />
          </Pressable>
        </View>

        {profile.autoApplyEnabled && (
          <View
            style={[
              styles.autoBanner,
              { backgroundColor: isDark ? "#002B27" : "#E6FBF8" },
            ]}
          >
            <View style={styles.autoRow}>
              <View style={[styles.autoDot, { backgroundColor: C.accent }]} />
              <Text style={[styles.autoText, { color: C.accent }]}>
                Auto-Apply is active
              </Text>
            </View>
            <Text style={[styles.autoSub, { color: C.textSecondary }]}>
              Searching for {profile.preferredRoles.join(", ") || "matching roles"}
            </Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.statsRow}>
          <StatCard value={stats.applied} label="Applied" color={C.tint} />
          <StatCard
            value={stats.interviews}
            label="Interviews"
            color={C.warning}
          />
          <StatCard value={stats.offers} label="Offers" color={C.success} />
          <StatCard
            value={`${stats.rate}%`}
            label="Rate"
            color={C.accent}
          />
        </View>

        {pipeline.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Pipeline" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pipelineRow}
            >
              {pipeline.map(({ status, count }) => (
                <Pressable
                  key={status}
                  style={[
                    styles.pipelineCard,
                    { backgroundColor: C.surface, borderColor: C.border },
                  ]}
                  onPress={() => router.push({ pathname: "/(tabs)/jobs", params: { filter: status } })}
                >
                  <Text style={[styles.pipelineCount, { color: C.text }]}>
                    {count}
                  </Text>
                  <Text
                    style={[styles.pipelineLabel, { color: C.textSecondary }]}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <SectionHeader
            title="Recent Activity"
            action={recentJobs.length > 0 ? "See all" : undefined}
            onAction={() => router.push("/(tabs)/jobs")}
          />
          {recentJobs.length === 0 ? (
            <Pressable
              style={[
                styles.emptyCard,
                { backgroundColor: C.surface, borderColor: C.border },
              ]}
              onPress={handleAddJob}
            >
              <Feather name="plus-circle" size={28} color={C.tint} />
              <Text style={[styles.emptyTitle, { color: C.text }]}>
                Add your first job
              </Text>
              <Text style={[styles.emptySubtitle, { color: C.textSecondary }]}>
                Track applications and stay organized
              </Text>
            </Pressable>
          ) : (
            recentJobs.map((job) => <JobCard key={job.id} job={job} />)
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  greeting: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 2,
  },
  name: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  autoBanner: {
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  autoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  autoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  autoText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  autoSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    paddingLeft: 14,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 8,
  },
  pipelineRow: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 10,
  },
  pipelineCard: {
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    minWidth: 80,
    borderWidth: 1,
  },
  pipelineCount: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  pipelineLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  emptyCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginTop: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
