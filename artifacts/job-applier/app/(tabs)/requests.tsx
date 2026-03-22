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
import { useApp, type QuoteRequestStatus } from "@/context/AppContext";
import EmptyState from "@/components/EmptyState";

type FilterTab = QuoteRequestStatus | "all";

const FILTER_TABS: { label: string; value: FilterTab }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Reviewed", value: "reviewed" },
  { label: "Converted", value: "converted" },
  { label: "Rejected", value: "rejected" },
];

const STATUS_COLORS: Record<QuoteRequestStatus, string> = {
  pending: "#3B82F6",
  reviewed: "#F59E0B",
  converted: "#10B981",
  rejected: "#EF4444",
};

function RequestCard({ item }: { item: import("@/context/AppContext").QuoteRequest }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const statusColor = STATUS_COLORS[item.status];

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    router.push({ pathname: "/quote-request/[id]", params: { id: item.id } });
  };

  const date = new Date(item.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const statusLabel =
    item.status === "pending" ? "Pending" :
    item.status === "reviewed" ? "Reviewed" :
    item.status === "converted" ? "Converted" : "Rejected";

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
        <View style={[styles.avatar, { backgroundColor: statusColor + "22" }]}>
          <Feather name="user" size={18} color={statusColor} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.customerName, { color: C.text }]} numberOfLines={1}>
            {item.customerName}
          </Text>
          <Text style={[styles.customerContact, { color: C.textSecondary }]} numberOfLines={1}>
            {item.customerEmail}
          </Text>
        </View>
        <View style={styles.cardRight}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + "22" }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
          <Text style={[styles.dateText, { color: C.textTertiary }]}>{date}</Text>
        </View>
      </View>
      <Text style={[styles.description, { color: C.textSecondary }]} numberOfLines={2}>
        {item.projectDescription}
      </Text>
      {item.customerAddress && (
        <View style={styles.metaRow}>
          <Feather name="map-pin" size={12} color={C.textTertiary} />
          <Text style={[styles.metaText, { color: C.textTertiary }]}>{item.customerAddress}</Text>
        </View>
      )}
      {item.desiredDate && (
        <View style={styles.metaRow}>
          <Feather name="calendar" size={12} color={C.textTertiary} />
          <Text style={[styles.metaText, { color: C.textTertiary }]}>
            Desired: {new Date(item.desiredDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export default function RequestsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { quoteRequests, isLoading, refreshAll } = useApp();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  const filtered = useMemo(
    () => activeFilter === "all" ? quoteRequests : quoteRequests.filter((qr) => qr.status === activeFilter),
    [quoteRequests, activeFilter]
  );

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View
        style={[styles.header, { paddingTop: topPad + 16, backgroundColor: C.background, borderBottomColor: C.border }]}
      >
        <View style={styles.titleRow}>
          <Text style={[styles.headerTitle, { color: C.text }]}>Quote Requests</Text>
          <Pressable
            style={[styles.addBtn, { backgroundColor: C.tint }]}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/quote-request/new");
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
                ? quoteRequests.length
                : quoteRequests.filter((qr) => qr.status === tab.value).length;
            const isActive = activeFilter === tab.value;
            return (
              <Pressable
                key={tab.value}
                style={[
                  styles.filterTab,
                  {
                    backgroundColor: isActive ? C.tint : isDark ? C.surfaceSecondary : "#F3F4F6",
                  },
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
        renderItem={({ item }) => <RequestCard item={item} />}
        contentContainerStyle={[styles.list, filtered.length === 0 && styles.listEmpty]}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.tint} />}
        ListEmptyComponent={
          <EmptyState
            icon="inbox"
            title={activeFilter === "all" ? "No quote requests yet" : `No ${activeFilter} requests`}
            subtitle={activeFilter === "all" ? "Requests will appear here when customers submit them" : "Try a different filter"}
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
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: { flex: 1, gap: 2 },
  customerName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  customerContact: { fontSize: 12, fontFamily: "Inter_400Regular" },
  cardRight: { alignItems: "flex-end", gap: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  dateText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  description: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
