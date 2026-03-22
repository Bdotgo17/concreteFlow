import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
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
import { useApp } from "@/context/AppContext";
import StatCard from "@/components/StatCard";
import SectionHeader from "@/components/SectionHeader";

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { quoteRequests, quotes, invoices, isLoading, refreshAll } = useApp();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  const stats = useMemo(() => {
    const newRequests = quoteRequests.filter((qr) => qr.status === "pending").length;
    const activeQuotes = quotes.filter((q) => q.status === "sent" || q.status === "draft").length;
    const unpaidInvoices = invoices.filter((inv) => inv.status === "unpaid").length;
    const totalOutstanding = invoices
      .filter((inv) => inv.status === "unpaid")
      .reduce((sum, inv) => sum + parseFloat(inv.total), 0);
    return { newRequests, activeQuotes, unpaidInvoices, totalOutstanding };
  }, [quoteRequests, quotes, invoices]);

  const recentRequests = useMemo(
    () => [...quoteRequests].slice(0, 3),
    [quoteRequests]
  );

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: C.background }]}>
        <ActivityIndicator size="large" color={C.tint} />
        <Text style={[styles.loadingText, { color: C.textSecondary }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <LinearGradient
        colors={isDark ? ["#1A0F00", "#0F0A06"] : ["#FEF3C7", C.background]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.greeting, { color: C.textSecondary }]}>Welcome back</Text>
            <Text style={[styles.name, { color: C.text }]}>ConcreteFlow</Text>
          </View>
          <Pressable
            style={[styles.addBtn, { backgroundColor: C.tint }]}
            onPress={() => router.push("/quote-request/new")}
          >
            <Feather name="plus" size={20} color="#fff" />
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.tint} />}
      >
        <View style={styles.statsRow}>
          <StatCard value={stats.newRequests} label="New Requests" color={C.info} />
          <StatCard value={stats.activeQuotes} label="Active Quotes" color={C.tint} />
          <StatCard value={stats.unpaidInvoices} label="Unpaid" color={C.warning} />
          <StatCard
            value={`$${(stats.totalOutstanding / 1000).toFixed(1)}k`}
            label="Outstanding"
            color={C.success}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Recent Requests"
            action={quoteRequests.length > 0 ? "See all" : undefined}
            onAction={() => router.push("/(tabs)/requests")}
          />
          {recentRequests.length === 0 ? (
            <Pressable
              style={[styles.emptyCard, { backgroundColor: C.surface, borderColor: C.border }]}
              onPress={() => router.push("/quote-request/new")}
            >
              <Feather name="plus-circle" size={28} color={C.tint} />
              <Text style={[styles.emptyTitle, { color: C.text }]}>No quote requests yet</Text>
              <Text style={[styles.emptySubtitle, { color: C.textSecondary }]}>
                Add a new request or let customers submit through the app
              </Text>
            </Pressable>
          ) : (
            recentRequests.map((qr) => {
              const statusColor =
                qr.status === "pending" ? C.info :
                qr.status === "reviewed" ? C.warning :
                qr.status === "converted" ? C.success : C.error;
              const statusLabel =
                qr.status === "pending" ? "Pending" :
                qr.status === "reviewed" ? "Reviewed" :
                qr.status === "converted" ? "Converted" : "Rejected";
              return (
                <Pressable
                  key={qr.id}
                  style={[styles.requestCard, { backgroundColor: C.surface, borderColor: C.border }]}
                  onPress={() => router.push({ pathname: "/quote-request/[id]", params: { id: qr.id } })}
                >
                  <View style={styles.requestTop}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <Text style={[styles.requestName, { color: C.text }]} numberOfLines={1}>
                      {qr.customerName}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + "22" }]}>
                      <Text style={[styles.statusText, { color: statusColor }]}>
                        {statusLabel}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.requestDesc, { color: C.textSecondary }]} numberOfLines={2}>
                    {qr.projectDescription}
                  </Text>
                  {qr.customerAddress && (
                    <View style={styles.requestMeta}>
                      <Feather name="map-pin" size={12} color={C.textTertiary} />
                      <Text style={[styles.requestMetaText, { color: C.textTertiary }]}>{qr.customerAddress}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Quick Actions" />
          <View style={styles.actionsGrid}>
            <Pressable
              style={[styles.actionCard, { backgroundColor: C.surface, borderColor: C.border }]}
              onPress={() => router.push("/(tabs)/requests")}
            >
              <View style={[styles.actionIcon, { backgroundColor: C.infoSoft }]}>
                <Feather name="inbox" size={20} color={C.info} />
              </View>
              <Text style={[styles.actionLabel, { color: C.text }]}>Quote Requests</Text>
              <Text style={[styles.actionSub, { color: C.textSecondary }]}>
                {quoteRequests.filter((qr) => qr.status === "pending").length} pending
              </Text>
            </Pressable>
            <Pressable
              style={[styles.actionCard, { backgroundColor: C.surface, borderColor: C.border }]}
              onPress={() => router.push("/(tabs)/quotes")}
            >
              <View style={[styles.actionIcon, { backgroundColor: C.warningSoft }]}>
                <Feather name="file-text" size={20} color={C.tint} />
              </View>
              <Text style={[styles.actionLabel, { color: C.text }]}>Quotes</Text>
              <Text style={[styles.actionSub, { color: C.textSecondary }]}>
                {quotes.length} total
              </Text>
            </Pressable>
            <Pressable
              style={[styles.actionCard, { backgroundColor: C.surface, borderColor: C.border }]}
              onPress={() => router.push("/(tabs)/invoices")}
            >
              <View style={[styles.actionIcon, { backgroundColor: C.successSoft }]}>
                <Feather name="dollar-sign" size={20} color={C.success} />
              </View>
              <Text style={[styles.actionLabel, { color: C.text }]}>Invoices</Text>
              <Text style={[styles.actionSub, { color: C.textSecondary }]}>
                {invoices.filter((inv) => inv.status === "unpaid").length} unpaid
              </Text>
            </Pressable>
            <Pressable
              style={[styles.actionCard, { backgroundColor: C.surface, borderColor: C.border }]}
              onPress={() => router.push("/(tabs)/customer")}
            >
              <View style={[styles.actionIcon, { backgroundColor: isDark ? C.surfaceSecondary : C.concreteSoft }]}>
                <Feather name="user" size={20} color={C.concrete} />
              </View>
              <Text style={[styles.actionLabel, { color: C.text }]}>Customer Portal</Text>
              <Text style={[styles.actionSub, { color: C.textSecondary }]}>Submit request</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  requestCard: {
    marginHorizontal: 16,
    marginVertical: 5,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 6,
  },
  requestTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  requestName: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  requestDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  requestMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  requestMetaText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
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
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 10,
  },
  actionCard: {
    flex: 1,
    minWidth: "44%",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 6,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  actionSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
