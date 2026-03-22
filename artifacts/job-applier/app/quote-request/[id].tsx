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
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useApp, type QuoteRequestStatus } from "@/context/AppContext";

const STATUS_COLORS: Record<QuoteRequestStatus, string> = {
  pending: "#3B82F6",
  reviewed: "#F59E0B",
  converted: "#10B981",
  rejected: "#EF4444",
};

const STATUS_LABELS: Record<QuoteRequestStatus, string> = {
  pending: "Pending",
  reviewed: "Reviewed",
  converted: "Converted",
  rejected: "Rejected",
};

const NEXT_STATUS: Partial<Record<QuoteRequestStatus, QuoteRequestStatus>> = {
  pending: "reviewed",
};

export default function QuoteRequestDetailScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { quoteRequests, updateQuoteRequestStatus } = useApp();
  const [loading, setLoading] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const request = quoteRequests.find((qr) => qr.id === Number(id));
  if (!request) {
    return (
      <View style={[styles.container, { backgroundColor: C.background }]}>
        <Pressable style={[styles.backBtn, { marginTop: topPad + 16 }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Text style={[styles.notFound, { color: C.textSecondary }]}>Request not found</Text>
      </View>
    );
  }

  const statusColor = STATUS_COLORS[request.status];
  const nextStatus = NEXT_STATUS[request.status];

  const handleUpdateStatus = async (status: QuoteRequestStatus) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      await updateQuoteRequestStatus(request.id, status);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuote = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: "/quote/new", params: { fromRequestId: request.id } });
  };

  const handleReject = () => {
    Alert.alert("Reject Request", "Mark this request as rejected?", [
      { text: "Cancel", style: "cancel" },
      { text: "Reject", style: "destructive", onPress: () => handleUpdateStatus("rejected") },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: C.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: C.text }]}>Quote Request</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "22" }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {STATUS_LABELS[request.status]}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 40 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Customer</Text>
          <InfoRow icon="user" label="Name" value={request.customerName} C={C} />
          <InfoRow icon="mail" label="Email" value={request.customerEmail} C={C} />
          {request.customerPhone && <InfoRow icon="phone" label="Phone" value={request.customerPhone} C={C} />}
          {request.customerAddress && <InfoRow icon="map-pin" label="Address" value={request.customerAddress} C={C} />}
        </View>

        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Project</Text>
          <Text style={[styles.description, { color: C.textSecondary }]}>{request.projectDescription}</Text>
          {request.desiredDate && (
            <InfoRow icon="calendar" label="Desired Date" value={new Date(request.desiredDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} C={C} />
          )}
          <InfoRow icon="clock" label="Submitted" value={new Date(request.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} C={C} />
          {request.notes && (
            <InfoRow icon="edit-3" label="Notes" value={request.notes} C={C} />
          )}
        </View>

        <View style={styles.actionsSection}>
          {nextStatus && request.status !== "rejected" && (
            <Pressable
              style={[styles.primaryBtn, { backgroundColor: C.tint, opacity: loading ? 0.7 : 1 }]}
              onPress={() => handleUpdateStatus(nextStatus)}
              disabled={loading}
            >
              <Feather name="arrow-right-circle" size={18} color="#fff" />
              <Text style={styles.primaryBtnText}>
                Mark as {STATUS_LABELS[nextStatus]}
              </Text>
            </Pressable>
          )}

          {request.status !== "rejected" && request.status !== "converted" && (
            <Pressable
              style={[styles.primaryBtn, { backgroundColor: C.success }]}
              onPress={handleCreateQuote}
            >
              <Feather name="file-text" size={18} color="#fff" />
              <Text style={styles.primaryBtnText}>Create Quote</Text>
            </Pressable>
          )}

          {request.status !== "rejected" && (
            <Pressable
              style={[styles.outlineBtn, { borderColor: C.error }]}
              onPress={handleReject}
              disabled={loading}
            >
              <Feather name="x-circle" size={16} color={C.error} />
              <Text style={[styles.outlineBtnText, { color: C.error }]}>Reject Request</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value, C }: { icon: keyof typeof Feather.glyphMap; label: string; value: string; C: typeof import("@/constants/colors").default.light }) {
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIcon, { backgroundColor: C.surfaceSecondary }]}>
        <Feather name={icon} size={14} color={C.tint} />
      </View>
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: C.textSecondary }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: C.text }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, marginLeft: 8, fontSize: 18, fontFamily: "Inter_700Bold" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statusText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  notFound: { textAlign: "center", marginTop: 40, fontSize: 16, fontFamily: "Inter_400Regular" },
  scroll: { padding: 16, gap: 14 },
  section: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  description: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  infoIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  infoContent: { flex: 1, gap: 1 },
  infoLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  infoValue: { fontSize: 14, fontFamily: "Inter_500Medium" },
  actionsSection: { gap: 10 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  primaryBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  outlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
  },
  outlineBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
