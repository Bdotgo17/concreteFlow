import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
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
import { useApp, type InvoiceStatus } from "@/context/AppContext";
import EmptyState from "@/components/EmptyState";

type FilterTab = InvoiceStatus | "all";

const FILTER_TABS: { label: string; value: FilterTab }[] = [
  { label: "All", value: "all" },
  { label: "Unpaid", value: "unpaid" },
  { label: "Paid", value: "paid" },
];

function InvoiceCard({ item }: { item: import("@/context/AppContext").Invoice }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const { updateInvoiceStatus, getQuoteRequest, quotes } = useApp();
  const isPaid = item.status === "paid";
  const statusColor = isPaid ? C.success : C.warning;
  const isOverdue = !isPaid && item.dueDate != null && new Date(item.dueDate) < new Date();
  const total = parseFloat(item.total);

  const linkedQuote = quotes.find((q) => q.id === item.quoteId);
  const linkedRequest = linkedQuote ? getQuoteRequest(linkedQuote.quoteRequestId) : undefined;
  const displayName = linkedRequest?.customerName ?? `Invoice #${item.id}`;

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    router.push({ pathname: "/invoice/[id]", params: { id: item.id } });
  };

  const handleTogglePaid = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isPaid) {
      Alert.alert("Mark Unpaid?", "Are you sure you want to mark this invoice as unpaid?", [
        { text: "Cancel", style: "cancel" },
        { text: "Mark Unpaid", style: "destructive", onPress: () => updateInvoiceStatus(item.id, "unpaid") },
      ]);
    } else {
      updateInvoiceStatus(item.id, "paid");
    }
  };

  const dueDate = item.dueDate
    ? new Date(item.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: C.surface,
          borderColor: isOverdue && !isPaid ? C.error + "44" : C.border,
          shadowColor: C.cardShadow,
          opacity: pressed ? 0.95 : 1,
        },
      ]}
    >
      <View style={styles.cardTop}>
        <View style={[styles.invoiceIcon, { backgroundColor: statusColor + "22" }]}>
          <Feather name="dollar-sign" size={18} color={statusColor} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.customerName, { color: C.text }]} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={[styles.dueText, { color: isOverdue && !isPaid ? C.error : C.textSecondary }]}>
            {isPaid
              ? "Paid"
              : dueDate
              ? `Due ${dueDate}${isOverdue ? " · OVERDUE" : ""}`
              : "No due date"}
          </Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={[styles.totalText, { color: C.text }]}>
            ${total.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </Text>
          <Pressable
            style={[styles.statusToggle, { backgroundColor: statusColor + "22", borderColor: statusColor + "44" }]}
            onPress={(e) => {
              e.stopPropagation();
              handleTogglePaid();
            }}
          >
            <Feather name={isPaid ? "check-circle" : "circle"} size={14} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {isPaid ? "Paid" : "Unpaid"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

export default function InvoicesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { invoices, isLoading, refreshAll } = useApp();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  const filtered = useMemo(
    () => activeFilter === "all" ? invoices : invoices.filter((inv) => inv.status === activeFilter),
    [invoices, activeFilter]
  );

  const totalOutstanding = useMemo(
    () => invoices.filter((inv) => inv.status === "unpaid").reduce((sum, inv) => sum + parseFloat(inv.total), 0),
    [invoices]
  );

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View
        style={[styles.header, { paddingTop: topPad + 16, backgroundColor: C.background, borderBottomColor: C.border }]}
      >
        <View style={styles.titleRow}>
          <Text style={[styles.headerTitle, { color: C.text }]}>Invoices</Text>
        </View>

        {totalOutstanding > 0 && (
          <View style={[styles.outstandingBanner, { backgroundColor: isDark ? C.warningSoft : "#FFFBEB", borderColor: C.warning + "44" }]}>
            <Feather name="alert-circle" size={14} color={C.warning} />
            <Text style={[styles.outstandingText, { color: C.warning }]}>
              ${totalOutstanding.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} outstanding
            </Text>
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTER_TABS.map((tab) => {
            const count =
              tab.value === "all"
                ? invoices.length
                : invoices.filter((inv) => inv.status === tab.value).length;
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
        renderItem={({ item }) => <InvoiceCard item={item} />}
        contentContainerStyle={[styles.list, filtered.length === 0 && styles.listEmpty]}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.tint} />}
        ListEmptyComponent={
          <EmptyState
            icon="dollar-sign"
            title={activeFilter === "all" ? "No invoices yet" : `No ${activeFilter} invoices`}
            subtitle={activeFilter === "all" ? "Invoices will appear here once created from quotes" : "Try a different filter"}
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
    marginBottom: 12,
  },
  headerTitle: { fontSize: 26, fontFamily: "Inter_700Bold" },
  outstandingBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  outstandingText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
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
  invoiceIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: { flex: 1, gap: 2 },
  customerName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  dueText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  cardRight: { alignItems: "flex-end", gap: 6 },
  totalText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  statusToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
});
