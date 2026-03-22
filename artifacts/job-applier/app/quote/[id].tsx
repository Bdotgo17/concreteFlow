import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useApp, type QuoteStatus, type Quote, type LineItem } from "@/context/AppContext";

function getApiBase(): string {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}`;
  return "";
}

const STATUS_COLORS: Record<QuoteStatus, string> = {
  draft: "#6B7280",
  sent: "#3B82F6",
  accepted: "#10B981",
  declined: "#EF4444",
};

export default function QuoteDetailScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { quotes, updateQuoteStatus, createInvoiceFromQuote, getQuoteRequest } = useApp();
  const [loading, setLoading] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const quote = quotes.find((q) => q.id === Number(id));
  const quoteRequest = quote ? getQuoteRequest(quote.quoteRequestId) : undefined;

  useEffect(() => {
    if (!quote) return;
    const base = getApiBase();
    fetch(`${base}/api/quotes/${quote.id}`, {
      headers: { "Content-Type": "application/json" },
    })
      .then((r) => r.json())
      .then((data: Quote & { lineItems?: LineItem[] }) => {
        setLineItems(data.lineItems ?? []);
      })
      .catch(console.error)
      .finally(() => setLoadingItems(false));
  }, [quote?.id]);

  if (!quote) {
    return (
      <View style={[styles.container, { backgroundColor: C.background }]}>
        <Pressable style={[styles.backBtn, { marginTop: topPad + 16, marginLeft: 16 }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Text style={[styles.notFound, { color: C.textSecondary }]}>Quote not found</Text>
      </View>
    );
  }

  const statusColor = STATUS_COLORS[quote.status];
  const total = lineItems.reduce((sum, li) => sum + parseFloat(li.quantity) * parseFloat(li.unitPrice), 0);

  const handleUpdateStatus = async (status: QuoteStatus) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      await updateQuoteStatus(quote.id, status);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = () => {
    Alert.alert("Create Invoice", "Generate an invoice from this quote?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Create",
        onPress: async () => {
          setLoading(true);
          try {
            await createInvoiceFromQuote(quote.id);
            router.push("/(tabs)/invoices");
          } catch {
            Alert.alert("Error", "Failed to create invoice.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: C.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtnInline}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: C.text }]}>Quote #{quote.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "22" }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 40 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {quoteRequest && (
          <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
            <View style={styles.customerRow}>
              <View style={[styles.avatar, { backgroundColor: C.tint + "22" }]}>
                <Feather name="user" size={20} color={C.tint} />
              </View>
              <View style={styles.customerInfo}>
                <Text style={[styles.customerName, { color: C.text }]}>{quoteRequest.customerName}</Text>
                <Text style={[styles.customerEmail, { color: C.textSecondary }]}>{quoteRequest.customerEmail}</Text>
              </View>
            </View>
            <Text style={[styles.dateText, { color: C.textTertiary }]}>
              Created {new Date(quote.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </Text>
          </View>
        )}

        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Line Items</Text>
          {loadingItems ? (
            <ActivityIndicator size="small" color={C.tint} />
          ) : lineItems.length === 0 ? (
            <Text style={[styles.emptyItems, { color: C.textSecondary }]}>No line items yet</Text>
          ) : (
            lineItems.map((li) => {
              const subtotal = parseFloat(li.quantity) * parseFloat(li.unitPrice);
              return (
                <View key={li.id} style={[styles.lineItem, { borderBottomColor: C.border }]}>
                  <View style={styles.lineItemLeft}>
                    <Text style={[styles.lineDesc, { color: C.text }]}>{li.description}</Text>
                    <Text style={[styles.lineQty, { color: C.textSecondary }]}>
                      {li.quantity} {li.unit} × ${parseFloat(li.unitPrice).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                  <Text style={[styles.lineSubtotal, { color: C.text }]}>
                    ${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              );
            })
          )}
          {!loadingItems && lineItems.length > 0 && (
            <View style={[styles.totalRow, { borderTopColor: C.border }]}>
              <Text style={[styles.totalLabel, { color: C.textSecondary }]}>Total</Text>
              <Text style={[styles.totalValue, { color: C.text }]}>
                ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </Text>
            </View>
          )}
        </View>

        {quote.notes && (
          <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Text style={[styles.sectionTitle, { color: C.text }]}>Notes</Text>
            <Text style={[styles.notesText, { color: C.textSecondary }]}>{quote.notes}</Text>
          </View>
        )}

        <View style={styles.actionsSection}>
          {quote.status === "draft" && (
            <Pressable
              style={[styles.primaryBtn, { backgroundColor: C.info, opacity: loading ? 0.7 : 1 }]}
              onPress={() => handleUpdateStatus("sent")}
              disabled={loading}
            >
              <Feather name="send" size={16} color="#fff" />
              <Text style={styles.primaryBtnText}>Mark as Sent</Text>
            </Pressable>
          )}
          {quote.status === "sent" && (
            <>
              <Pressable
                style={[styles.primaryBtn, { backgroundColor: C.success, opacity: loading ? 0.7 : 1 }]}
                onPress={() => handleUpdateStatus("accepted")}
                disabled={loading}
              >
                <Feather name="check" size={16} color="#fff" />
                <Text style={styles.primaryBtnText}>Mark Accepted</Text>
              </Pressable>
              <Pressable
                style={[styles.outlineBtn, { borderColor: C.error }]}
                onPress={() => handleUpdateStatus("declined")}
                disabled={loading}
              >
                <Text style={[styles.outlineBtnText, { color: C.error }]}>Mark Declined</Text>
              </Pressable>
            </>
          )}
          {quote.status === "accepted" && (
            <Pressable
              style={[styles.primaryBtn, { backgroundColor: C.tint, opacity: loading ? 0.7 : 1 }]}
              onPress={handleCreateInvoice}
              disabled={loading}
            >
              <Feather name="dollar-sign" size={16} color="#fff" />
              <Text style={styles.primaryBtnText}>Create Invoice</Text>
            </Pressable>
          )}
        </View>
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
  dateText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  emptyItems: { fontSize: 14, fontFamily: "Inter_400Regular", fontStyle: "italic" },
  lineItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  lineItemLeft: { flex: 1, gap: 2 },
  lineDesc: { fontSize: 14, fontFamily: "Inter_500Medium" },
  lineQty: { fontSize: 12, fontFamily: "Inter_400Regular" },
  lineSubtotal: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
  },
  totalLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  totalValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  notesText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
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
