import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
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
import { useApp, type Contact, type ContactRelationship } from "@/context/AppContext";
import EmptyState from "@/components/EmptyState";

const RELATIONSHIP_CONFIG: Record<
  ContactRelationship,
  { label: string; icon: keyof typeof Feather.glyphMap; color: string }
> = {
  recruiter: { label: "Recruiter", icon: "search", color: "#1B4FFF" },
  "hiring-manager": { label: "Hiring Mgr", icon: "user-check", color: "#7C3AED" },
  colleague: { label: "Colleague", icon: "users", color: "#059669" },
  mentor: { label: "Mentor", icon: "award", color: "#D97706" },
  referral: { label: "Referral", icon: "share-2", color: "#DB2777" },
  friend: { label: "Friend", icon: "heart", color: "#0891B2" },
  other: { label: "Other", icon: "more-horizontal", color: "#6B7280" },
};

const FILTER_TABS: { label: string; value: ContactRelationship | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Recruiters", value: "recruiter" },
  { label: "Hiring Mgrs", value: "hiring-manager" },
  { label: "Referrals", value: "referral" },
  { label: "Mentors", value: "mentor" },
  { label: "Colleagues", value: "colleague" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function ContactCard({ contact }: { contact: Contact }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const rel = RELATIONSHIP_CONFIG[contact.relationship];

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    router.push({ pathname: "/contact/[id]", params: { id: contact.id } });
  };

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
      <View style={[styles.avatar, { backgroundColor: contact.avatarColor }]}>
        <Text style={styles.avatarText}>{getInitials(contact.name)}</Text>
      </View>

      <View style={styles.cardInfo}>
        <Text style={[styles.contactName, { color: C.text }]} numberOfLines={1}>
          {contact.name}
        </Text>
        <Text style={[styles.contactRole, { color: C.textSecondary }]} numberOfLines={1}>
          {contact.role} · {contact.company}
        </Text>
        {contact.email && (
          <Text style={[styles.contactEmail, { color: C.textTertiary }]} numberOfLines={1}>
            {contact.email}
          </Text>
        )}
      </View>

      <View style={styles.cardRight}>
        <View
          style={[
            styles.relBadge,
            { backgroundColor: isDark ? "#0C1A3F" : "#EEF3FF" },
          ]}
        >
          <Feather name={rel.icon} size={11} color={rel.color} />
          <Text style={[styles.relText, { color: rel.color }]}>{rel.label}</Text>
        </View>
        <Feather name="chevron-right" size={16} color={C.textTertiary} style={{ marginTop: 8 }} />
      </View>
    </Pressable>
  );
}

export default function NetworkScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { contacts } = useApp();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ContactRelationship | "all">("all");

  const filtered = useMemo(() => {
    let list = contacts;
    if (activeFilter !== "all") {
      list = list.filter((c) => c.relationship === activeFilter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [contacts, activeFilter, query]);

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
          <Text style={[styles.title, { color: C.text }]}>Network</Text>
          <Pressable
            style={[styles.addBtn, { backgroundColor: C.tint }]}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/add-contact");
            }}
          >
            <Feather name="user-plus" size={17} color="#fff" />
          </Pressable>
        </View>

        <View
          style={[
            styles.searchBox,
            { backgroundColor: C.surface, borderColor: C.border },
          ]}
        >
          <Feather name="search" size={16} color={C.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: C.text }]}
            placeholder="Search contacts..."
            placeholderTextColor={C.textTertiary}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <Feather name="x-circle" size={15} color={C.textTertiary} />
            </Pressable>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTER_TABS.map((tab) => {
            const count =
              tab.value === "all"
                ? contacts.length
                : contacts.filter((c) => c.relationship === tab.value).length;
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
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ContactCard contact={item} />}
        contentContainerStyle={[
          styles.list,
          filtered.length === 0 && styles.listEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        ListEmptyComponent={
          contacts.length === 0 ? (
            <EmptyState
              icon="users"
              title="No contacts yet"
              subtitle="Add recruiters, hiring managers, and mentors to grow your network"
            />
          ) : (
            <EmptyState
              icon="search"
              title="No matches"
              subtitle="Try a different search or filter"
            />
          )
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
    marginBottom: 14,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  filterRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 5,
  },
  filterLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  filterCount: {
    borderRadius: 10,
    minWidth: 18,
    paddingHorizontal: 4,
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
  listEmpty: { flex: 1 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  cardInfo: { flex: 1, gap: 2 },
  contactName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  contactRole: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  contactEmail: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  cardRight: {
    alignItems: "flex-end",
  },
  relBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  relText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
});
