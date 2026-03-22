import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useApp, type QuoteStatus } from "@/context/AppContext";
import EmptyState from "@/components/EmptyState";

type FilterTab = QuoteStatus | "all";

const FILTER_TABS: { label: string; value: FilterTab }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Accepted", value: "accepted" },
  { label: "Declined", value: "declined" },
];

const STATUS_COLORS: Record<QuoteStatus, string> = {
  draft: "#6B7280",
  sent: "#3B82F6",
  accepted: "#10B981",
  declined: "#EF4444",
};

function QuoteCard({ item }: { item: import("@/context/AppContext").Quote }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const { getQuoteRequest } = useApp();
  const statusColor = STATUS_COLORS[item.status];
  const quoteRequest = getQuoteRequest(item.quoteRequestId);

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    router.push({ pathname: "/quote/[id]", params: { id: item.id } });
  };

  const date = new Date(item.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

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
        },
      ]}
    >
      <View style={styles.cardTop}>
        <View style={[styles.quoteIcon, { backgroundColor: statusColor + "22" }]}>
          <Feather name="file-text" size={18} color={statusColor} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.customerName, { color: C.text }]} numberOfLines={1}>
            {quoteRequest?.customerName ?? `Quote #${item.id}`}
          </Text>
          <Text style={[styles.lineCount, { color: C.textSecondary }]}>
            {quoteRequest?.customerEmail ?? `Request #${item.quoteRequestId}`}
          </Text>
        </View>
        <View style={styles.cardRight}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + "22" }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
          <Text style={[styles.metaText, { color: C.textTertiary }]}>Updated {date}</Text>
        </View>
      </View>
      {item.notes && (
        <Text style={[styles.notes, { color: C.textSecondary }]} numberOfLines={1}>
          {item.notes}
        </Text>
      )}
    </Pressable>
  );
}

export default function QuotesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { quotes, isLoading, refreshAll } = useApp();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  const filtered = useMemo(
    () => activeFilter === "all" ? quotes : quotes.filter((q) => q.status === activeFilter),
    [quotes, activeFilter]
  );

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View
        style={[styles.header, { paddingTop: topPad + 16, backgroundColor: C.background, borderBottomColor: C.border }]}
      >
        <View style={styles.titleRow}>
          <Text style={[styles.headerTitle, { color: C.text }]}>Quotes</Text>
          <Pressable
            style={[styles.addBtn, { backgroundColor: C.tint }]}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/quote/new");
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
                ? quotes.length
                : quotes.filter((q) => q.status === tab.value).length;
            const isActive = activeFilter === tab.value;
            return (
              <Pressable
                key={tab.value}
                style={[
                  styles.filterTab,
                  { backgroundColor: isActive ? C.tint : isDark ? C.surfaceSecondary : "#F3F4F6" },
                ]}
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.selectionAsync();
                  setActiveFilter(tab.value);
                }}
              >
                <Text style={[styles.filterLabel, { color: isActive ? "#fff" : C.textSecondary }]}>
                  {tab.label}
                </Text>
                {count > 0 && (
                  <View style={[styles.filterCount, { backgroundColor: isActive ? "rgba(255,255,255,0.25)" : C.border }]}>
                    <Text style={[styles.filterCountText, { color: isActive ? "#fff" : C.textTertiary }]}>
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
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <QuoteCard item={item} />}
        contentContainerStyle={[styles.list, filtered.length === 0 && styles.listEmpty]}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.tint} />}
        ListEmptyComponent={
          <EmptyState
            icon="file-text"
            title={activeFilter === "all" ? "No quotes yet" : `No ${activeFilter} quotes`}
            subtitle={activeFilter === "all" ? "Tap + to create a new quote for a customer" : "Try a different filter"}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingBottom: 12, borderBottomWidth: 1 },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerTitle: { fontSize: 26, fontFamily: "Inter_700Bold" },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  filterRow: { paddingHorizontal: 16, gap: 8 },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  filterLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  filterCount: {
    borderRadius: 10,
    minWidth: 20,
    paddingHorizontal: 5,
    paddingVertical: 1,
    alignItems: "center",
  },
  filterCountText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  list: { paddingTop: 8, paddingBottom: 120 },
  listEmpty: { flex: 1 },
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    gap: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  quoteIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: { flex: 1, gap: 2 },
  customerName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  lineCount: { fontSize: 12, fontFamily: "Inter_400Regular" },
  cardRight: { alignItems: "flex-end", gap: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  notes: { fontSize: 12, fontFamily: "Inter_400Regular", fontStyle: "italic" },
  metaText: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
