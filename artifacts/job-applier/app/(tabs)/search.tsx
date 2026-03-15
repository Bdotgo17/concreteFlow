import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
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
import { useApp } from "@/context/AppContext";

const SAMPLE_JOBS = [
  { id: "s1", title: "Senior Software Engineer", company: "Stripe", location: "San Francisco, CA", salary: "$180k–$240k", jobType: "hybrid" as const, tags: ["React", "TypeScript", "Node.js"] },
  { id: "s2", title: "Product Designer", company: "Linear", location: "Remote", salary: "$130k–$160k", jobType: "remote" as const, tags: ["Figma", "Design Systems"] },
  { id: "s3", title: "Frontend Engineer", company: "Vercel", location: "Remote", salary: "$140k–$190k", jobType: "remote" as const, tags: ["Next.js", "React", "CSS"] },
  { id: "s4", title: "Backend Engineer", company: "PlanetScale", location: "New York, NY", salary: "$160k–$200k", jobType: "hybrid" as const, tags: ["Go", "MySQL", "Kubernetes"] },
  { id: "s5", title: "Data Scientist", company: "Anthropic", location: "San Francisco, CA", salary: "$200k–$280k", jobType: "full-time" as const, tags: ["Python", "ML", "PyTorch"] },
  { id: "s6", title: "iOS Engineer", company: "Figma", location: "San Francisco, CA", salary: "$170k–$220k", jobType: "hybrid" as const, tags: ["Swift", "SwiftUI", "iOS"] },
  { id: "s7", title: "DevOps Engineer", company: "Hashicorp", location: "Remote", salary: "$140k–$180k", jobType: "remote" as const, tags: ["Terraform", "AWS", "Kubernetes"] },
  { id: "s8", title: "Full Stack Engineer", company: "Notion", location: "San Francisco, CA", salary: "$150k–$200k", jobType: "hybrid" as const, tags: ["React", "Node.js", "PostgreSQL"] },
];

const LOGO_COLORS: Record<string, string> = {
  Stripe: "#635BFF",
  Linear: "#5E6AD2",
  Vercel: "#000000",
  PlanetScale: "#0F0F0F",
  Anthropic: "#D97706",
  Figma: "#FF7262",
  Hashicorp: "#000000",
  Notion: "#000000",
};

const QUICK_FILTERS = ["Remote", "Senior", "Frontend", "Backend", "Design", "Product", "Data", "DevOps"];

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { addJob, jobs } = useApp();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const appliedIds = new Set(jobs.map((j) => `${j.company}_${j.title}`));

  const filtered = SAMPLE_JOBS.filter((job) => {
    const matchesQuery =
      !query ||
      job.title.toLowerCase().includes(query.toLowerCase()) ||
      job.company.toLowerCase().includes(query.toLowerCase()) ||
      job.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()));
    const matchesFilter =
      !activeFilter ||
      job.location.toLowerCase().includes(activeFilter.toLowerCase()) ||
      job.title.toLowerCase().includes(activeFilter.toLowerCase()) ||
      job.tags.some((t) => t.toLowerCase().includes(activeFilter.toLowerCase())) ||
      job.jobType.toLowerCase().includes(activeFilter.toLowerCase());
    return matchesQuery && matchesFilter;
  });

  const handleSave = (job: (typeof SAMPLE_JOBS)[0]) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addJob({
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      jobType: job.jobType,
      status: "saved",
      tags: job.tags,
      logoColor: LOGO_COLORS[job.company] ?? C.tint,
    });
    setSavedIds((prev) => new Set([...prev, job.id]));
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View
        style={[styles.header, { paddingTop: topPad + 16, backgroundColor: C.background }]}
      >
        <Text style={[styles.title, { color: C.text }]}>Find Jobs</Text>
        <View
          style={[
            styles.searchBox,
            { backgroundColor: C.surface, borderColor: C.border },
          ]}
        >
          <Feather name="search" size={18} color={C.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: C.text }]}
            placeholder="Search roles, companies, skills..."
            placeholderTextColor={C.textTertiary}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <Feather name="x-circle" size={16} color={C.textTertiary} />
            </Pressable>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickFilters}
        >
          {QUICK_FILTERS.map((f) => (
            <Pressable
              key={f}
              style={[
                styles.quickChip,
                {
                  backgroundColor:
                    activeFilter === f
                      ? C.tint
                      : isDark
                      ? C.surfaceSecondary
                      : "#F3F4F6",
                },
              ]}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.selectionAsync();
                setActiveFilter(activeFilter === f ? null : f);
              }}
            >
              <Text
                style={[
                  styles.quickChipText,
                  { color: activeFilter === f ? "#fff" : C.textSecondary },
                ]}
              >
                {f}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.results}
        contentInsetAdjustmentBehavior="automatic"
      >
        <Text style={[styles.resultCount, { color: C.textSecondary }]}>
          {filtered.length} positions found
        </Text>

        {filtered.map((job) => {
          const key = `${job.company}_${job.title}`;
          const isSaved = savedIds.has(job.id);
          const isApplied = appliedIds.has(key);
          const initials = job.company.slice(0, 2).toUpperCase();

          return (
            <View
              key={job.id}
              style={[
                styles.card,
                { backgroundColor: C.surface, borderColor: C.border, shadowColor: C.cardShadow },
              ]}
            >
              <View style={styles.cardTop}>
                <View
                  style={[
                    styles.logo,
                    { backgroundColor: LOGO_COLORS[job.company] ?? C.tint },
                  ]}
                >
                  <Text style={styles.logoText}>{initials}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardTitle, { color: C.text }]} numberOfLines={1}>
                    {job.title}
                  </Text>
                  <Text style={[styles.cardCompany, { color: C.textSecondary }]}>
                    {job.company} · {job.location}
                  </Text>
                </View>
                <Pressable
                  style={[
                    styles.saveBtn,
                    {
                      backgroundColor:
                        isSaved || isApplied
                          ? isDark ? "#052E16" : "#ECFDF5"
                          : isDark ? C.surfaceSecondary : "#F3F4F6",
                    },
                  ]}
                  onPress={() => !isSaved && !isApplied && handleSave(job)}
                >
                  <Feather
                    name={isSaved || isApplied ? "check" : "bookmark"}
                    size={16}
                    color={isSaved || isApplied ? C.success : C.textTertiary}
                  />
                </Pressable>
              </View>

              <View style={styles.cardMeta}>
                <View style={[styles.metaBadge, { backgroundColor: isDark ? C.surfaceSecondary : "#F3F4F6" }]}>
                  <Text style={[styles.metaBadgeText, { color: C.textSecondary }]}>
                    {job.jobType}
                  </Text>
                </View>
                <Text style={[styles.salary, { color: C.success }]}>{job.salary}</Text>
              </View>

              <View style={styles.tags}>
                {job.tags.map((t) => (
                  <View
                    key={t}
                    style={[styles.tag, { backgroundColor: isDark ? "#0C1A3F" : "#EEF3FF" }]}
                  >
                    <Text style={[styles.tagText, { color: C.tint }]}>{t}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.cardActions}>
                <Pressable
                  style={[styles.applyBtn, { backgroundColor: C.tint }]}
                  onPress={() => {
                    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    addJob({
                      title: job.title,
                      company: job.company,
                      location: job.location,
                      salary: job.salary,
                      jobType: job.jobType,
                      status: "applied",
                      appliedDate: new Date().toISOString(),
                      tags: job.tags,
                      logoColor: LOGO_COLORS[job.company] ?? C.tint,
                    });
                    setSavedIds((prev) => new Set([...prev, job.id]));
                  }}
                  disabled={isApplied}
                >
                  <Text style={styles.applyBtnText}>
                    {isApplied ? "Applied" : "Quick Apply"}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    marginBottom: 14,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  quickFilters: {
    paddingVertical: 4,
    gap: 8,
  },
  quickChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  quickChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  results: {
    padding: 16,
    paddingBottom: 120,
    gap: 12,
  },
  resultCount: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  cardTop: {
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
  cardInfo: { flex: 1, gap: 2 },
  cardTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  cardCompany: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  saveBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  metaBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  salary: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  cardActions: {
    flexDirection: "row",
    gap: 10,
  },
  applyBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  applyBtnText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});
