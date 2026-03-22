import { Feather } from "@expo/vector-icons";
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

export default function ViewQuoteScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { quotes, invoices, quoteRequests } = useApp();
  const [emailQuery, setEmailQuery] = useState("");
  const [searched, setSearched] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const email = emailQuery.toLowerCase().trim();

  const matchedRequests = searched && email
    ? quoteRequests.filter((qr) => qr.customerEmail.toLowerCase() === email)
    : [];

  const matchedRequestIds = new Set(matchedRequests.map((qr) => qr.id));

  const matchedQuotes = searched && email
    ? quotes.filter((q) => matchedRequestIds.has(q.quoteRequestId))
    : [];

  const matchedQuoteIds = new Set(matchedQuotes.map((q) => q.id));

  const matchedInvoices = searched && email
    ? invoices.filter((inv) => matchedQuoteIds.has(inv.quoteId))
    : [];

  const handleSearch = () => {
    setSearched(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: C.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: C.text }]}>View My Quote</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 40 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={[styles.searchCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[styles.searchTitle, { color: C.text }]}>Look up your quote</Text>
          <Text style={[styles.searchSub, { color: C.textSecondary }]}>
            Enter the email address you provided when submitting your request
          </Text>
          <View style={[styles.inputRow, { backgroundColor: C.surfaceSecondary, borderColor: C.border }]}>
            <Feather name="mail" size={16} color={C.textTertiary} />
            <TextInput
              style={[styles.input, { color: C.text }]}
              value={emailQuery}
              onChangeText={(v) => { setEmailQuery(v); setSearched(false); }}
              placeholder="your@email.com"
              placeholderTextColor={C.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <Pressable
            style={[styles.searchBtn, { backgroundColor: C.tint }]}
            onPress={handleSearch}
          >
            <Feather name="search" size={16} color="#fff" />
            <Text style={styles.searchBtnText}>Look Up</Text>
          </Pressable>
        </View>

        {searched && matchedQuotes.length === 0 && matchedInvoices.length === 0 && (
          <View style={[styles.noResults, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Feather name="inbox" size={32} color={C.textTertiary} />
            <Text style={[styles.noResultsTitle, { color: C.text }]}>No results found</Text>
            <Text style={[styles.noResultsSub, { color: C.textSecondary }]}>
              We couldn't find any quotes or invoices for "{emailQuery}". Make sure you entered the same email used when submitting your request.
            </Text>
          </View>
        )}

        {matchedQuotes.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={[styles.resultsSectionTitle, { color: C.text }]}>Your Quotes</Text>
            {matchedQuotes.map((q) => {
              const request = quoteRequests.find((qr) => qr.id === q.quoteRequestId);
              const statusColor =
                q.status === "draft" ? C.textTertiary :
                q.status === "sent" ? C.info :
                q.status === "accepted" ? C.success : C.error;
              return (
                <View key={q.id} style={[styles.resultCard, { backgroundColor: C.surface, borderColor: C.border }]}>
                  <View style={styles.resultCardTop}>
                    <Text style={[styles.resultTitle, { color: C.text }]}>Quote from ConcreteFlow</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + "22" }]}>
                      <Text style={[styles.statusText, { color: statusColor }]}>
                        {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  {request && (
                    <Text style={[styles.projectDesc, { color: C.textSecondary }]} numberOfLines={2}>
                      {request.projectDescription}
                    </Text>
                  )}
                  <Text style={[styles.metaText, { color: C.textTertiary }]}>
                    Created {new Date(q.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </Text>
                  {q.notes && (
                    <Text style={[styles.notes, { color: C.textSecondary }]}>{q.notes}</Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {matchedInvoices.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={[styles.resultsSectionTitle, { color: C.text }]}>Your Invoices</Text>
            {matchedInvoices.map((inv) => {
              const isPaid = inv.status === "paid";
              const isOverdue = !isPaid && inv.dueDate != null && new Date(inv.dueDate) < new Date();
              const statusColor = isPaid ? C.success : isOverdue ? C.error : C.warning;
              const total = parseFloat(inv.total);
              return (
                <View key={inv.id} style={[styles.resultCard, { backgroundColor: C.surface, borderColor: C.border }]}>
                  <View style={styles.resultCardTop}>
                    <Text style={[styles.resultTitle, { color: C.text }]}>Invoice from ConcreteFlow</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + "22" }]}>
                      <Text style={[styles.statusText, { color: statusColor }]}>
                        {isPaid ? "Paid" : isOverdue ? "Overdue" : "Unpaid"}
                      </Text>
                    </View>
                  </View>
                  {inv.dueDate && (
                    <Text style={[styles.dueInfo, { color: isOverdue && !isPaid ? C.error : C.textSecondary }]}>
                      Due {new Date(inv.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </Text>
                  )}
                  <View style={[styles.totalRow, { borderTopColor: C.border }]}>
                    <Text style={[styles.totalLabel, { color: C.textSecondary }]}>Total Due</Text>
                    <Text style={[styles.totalValue, { color: C.text }]}>
                      ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                  {inv.notes && (
                    <Text style={[styles.notes, { color: C.textSecondary }]}>{inv.notes}</Text>
                  )}
                </View>
              );
            })}
          </View>
        )}
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
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  scroll: { padding: 16, gap: 16 },
  searchCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
  searchTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  searchSub: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  searchBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
  },
  searchBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  noResults: {
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    alignItems: "center",
    gap: 10,
  },
  noResultsTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  noResultsSub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 19 },
  resultsSection: { gap: 10 },
  resultsSectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  resultCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 10 },
  resultCardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  resultTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  projectDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  metaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  dueInfo: { fontSize: 13, fontFamily: "Inter_500Medium" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
  },
  totalLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  totalValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  notes: { fontSize: 13, fontFamily: "Inter_400Regular", fontStyle: "italic", lineHeight: 19 },
});
