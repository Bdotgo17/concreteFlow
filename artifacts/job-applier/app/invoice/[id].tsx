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
import { useApp } from "@/context/AppContext";

export default function InvoiceDetailScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { invoices, updateInvoiceStatus, quotes, getQuoteRequest } = useApp();
  const [loading, setLoading] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const invoice = invoices.find((inv) => inv.id === Number(id));

  const linkedQuote = invoice ? quotes.find((q) => q.id === invoice.quoteId) : undefined;
  const linkedRequest = linkedQuote ? getQuoteRequest(linkedQuote.quoteRequestId) : undefined;

  if (!invoice) {
    return (
      <View style={[styles.container, { backgroundColor: C.background }]}>
        <Pressable style={[styles.backBtn, { marginTop: topPad + 16, marginLeft: 16 }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Text style={[styles.notFound, { color: C.textSecondary }]}>Invoice not found</Text>
      </View>
    );
  }

  const isPaid = invoice.status === "paid";
  const isOverdue = !isPaid && invoice.dueDate != null && new Date(invoice.dueDate) < new Date();
  const statusColor = isPaid ? C.success : isOverdue ? C.error : C.warning;
  const total = parseFloat(invoice.total);

  const handleTogglePaid = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isPaid) {
      Alert.alert("Mark Unpaid?", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        { text: "Mark Unpaid", style: "destructive", onPress: async () => {
          setLoading(true);
          try {
            await updateInvoiceStatus(invoice.id, "unpaid");
          } finally { setLoading(false); }
        }},
      ]);
    } else {
      setLoading(true);
      updateInvoiceStatus(invoice.id, "paid")
        .finally(() => setLoading(false));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: C.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtnInline}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: C.text }]}>Invoice #{invoice.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "22" }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {isPaid ? "Paid" : isOverdue ? "Overdue" : "Unpaid"}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 40 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={styles.customerRow}>
            <View style={[styles.avatar, { backgroundColor: statusColor + "22" }]}>
              <Feather name="user" size={20} color={statusColor} />
            </View>
            <View style={styles.customerInfo}>
              <Text style={[styles.customerName, { color: C.text }]}>
                {linkedRequest?.customerName ?? `Invoice #${invoice.id}`}
              </Text>
              {linkedRequest?.customerEmail && (
                <Text style={[styles.customerEmail, { color: C.textSecondary }]}>{linkedRequest.customerEmail}</Text>
              )}
            </View>
          </View>
          <View style={styles.datesRow}>
            <View style={styles.dateItem}>
              <Text style={[styles.dateLabel, { color: C.textSecondary }]}>Invoice Date</Text>
              <Text style={[styles.dateValue, { color: C.text }]}>
                {new Date(invoice.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </Text>
            </View>
            {invoice.dueDate && (
              <View style={styles.dateItem}>
                <Text style={[styles.dateLabel, { color: C.textSecondary }]}>Due Date</Text>
                <Text style={[styles.dateValue, { color: isOverdue && !isPaid ? C.error : C.text }]}>
                  {new Date(invoice.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Amount</Text>
          <View style={[styles.totalRow, { borderTopColor: C.border }]}>
            <Text style={[styles.totalLabel, { color: C.textSecondary }]}>Total</Text>
            <Text style={[styles.totalValue, { color: C.text }]}>
              ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        {invoice.notes && (
          <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Text style={[styles.sectionTitle, { color: C.text }]}>Notes</Text>
            <Text style={[styles.notesText, { color: C.textSecondary }]}>{invoice.notes}</Text>
          </View>
        )}

        <Pressable
          style={[styles.toggleBtn, { backgroundColor: isPaid ? C.surfaceSecondary : C.success, opacity: loading ? 0.7 : 1, borderColor: isPaid ? C.border : C.success }]}
          onPress={handleTogglePaid}
          disabled={loading}
        >
          <Feather name={isPaid ? "circle" : "check-circle"} size={18} color={isPaid ? C.textSecondary : "#fff"} />
          <Text style={[styles.toggleBtnText, { color: isPaid ? C.textSecondary : "#fff" }]}>
            {isPaid ? "Mark as Unpaid" : "Mark as Paid"}
          </Text>
        </Pressable>
      </ScrollView>
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
  backBtnInline: { padding: 4 },
  headerTitle: { flex: 1, marginLeft: 8, fontSize: 18, fontFamily: "Inter_700Bold" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statusText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  notFound: { textAlign: "center", marginTop: 40, fontSize: 16, fontFamily: "Inter_400Regular" },
  scroll: { padding: 16, gap: 14 },
  section: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
  customerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  customerInfo: { flex: 1, gap: 2 },
  customerName: { fontSize: 17, fontFamily: "Inter_700Bold" },
  customerEmail: { fontSize: 13, fontFamily: "Inter_400Regular" },
  datesRow: { flexDirection: "row", gap: 16 },
  dateItem: { flex: 1, gap: 2 },
  dateLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  dateValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
  },
  totalLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  totalValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  notesText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  toggleBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
