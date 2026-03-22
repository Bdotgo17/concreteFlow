import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ActivityIndicator,
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

interface DraftLineItem {
  tempId: string;
  description: string;
  unit: string;
  quantity: string;
  unitPrice: string;
}

function generateTempId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export default function NewQuoteScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { fromRequestId } = useLocalSearchParams<{
    fromRequestId?: string;
  }>();
  const { createQuote, quoteRequests } = useApp();

  const linkedRequest = fromRequestId ? quoteRequests.find((qr) => qr.id === Number(fromRequestId)) : undefined;

  const [notes, setNotes] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [lineItems, setLineItems] = useState<DraftLineItem[]>([
    { tempId: generateTempId(), description: "", unit: "each", quantity: "1", unitPrice: "" },
  ]);
  const [saving, setSaving] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const total = lineItems.reduce((sum, li) => {
    const qty = parseFloat(li.quantity) || 0;
    const price = parseFloat(li.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  const addLineItem = () => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    setLineItems((prev) => [...prev, { tempId: generateTempId(), description: "", unit: "each", quantity: "1", unitPrice: "" }]);
  };

  const removeLineItem = (tempId: string) => {
    setLineItems((prev) => prev.filter((li) => li.tempId !== tempId));
  };

  const updateLineItem = (tempId: string, field: keyof DraftLineItem, value: string) => {
    setLineItems((prev) =>
      prev.map((li) => (li.tempId !== tempId ? li : { ...li, [field]: value }))
    );
  };

  const handleSave = async () => {
    if (!fromRequestId) {
      Alert.alert("Missing info", "Please select a quote request to link this quote to.");
      return;
    }
    const validItems = lineItems.filter((li) => li.description.trim());
    if (validItems.length === 0) {
      Alert.alert("Missing info", "Please add at least one line item with a description.");
      return;
    }
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);
    try {
      await createQuote({
        quoteRequestId: Number(fromRequestId),
        notes: notes.trim() || undefined,
        expiryDate: expiryDate.trim() || undefined,
        lineItems: validItems.map((li) => ({
          description: li.description.trim(),
          unit: li.unit.trim() || "each",
          quantity: li.quantity || "1",
          unitPrice: li.unitPrice || "0",
        })),
      });
      router.back();
    } catch {
      Alert.alert("Error", "Failed to create quote. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: C.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="x" size={22} color={C.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: C.text }]}>New Quote</Text>
        <Pressable
          style={[styles.saveBtn, { backgroundColor: saving ? C.border : C.tint }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 40 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {linkedRequest && (
          <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Text style={[styles.sectionTitle, { color: C.text }]}>Customer</Text>
            <View style={styles.customerRow}>
              <View style={[styles.avatar, { backgroundColor: C.tint + "22" }]}>
                <Feather name="user" size={18} color={C.tint} />
              </View>
              <View style={styles.customerInfo}>
                <Text style={[styles.customerName, { color: C.text }]}>{linkedRequest.customerName}</Text>
                <Text style={[styles.customerEmail, { color: C.textSecondary }]}>{linkedRequest.customerEmail}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, { color: C.text }]}>Line Items</Text>
            <Pressable onPress={addLineItem} style={[styles.addItemBtn, { backgroundColor: C.tint }]}>
              <Feather name="plus" size={14} color="#fff" />
              <Text style={styles.addItemBtnText}>Add</Text>
            </Pressable>
          </View>

          {lineItems.map((li, idx) => (
            <View key={li.tempId} style={[styles.lineItemCard, { backgroundColor: C.surfaceSecondary, borderColor: C.border }]}>
              <View style={styles.lineItemTop}>
                <Text style={[styles.lineItemNum, { color: C.textTertiary }]}>#{idx + 1}</Text>
                {lineItems.length > 1 && (
                  <Pressable onPress={() => removeLineItem(li.tempId)}>
                    <Feather name="trash-2" size={16} color={C.error} />
                  </Pressable>
                )}
              </View>
              <TextInput
                style={[styles.lineDesc, { color: C.text, borderColor: C.border, backgroundColor: C.surface }]}
                value={li.description}
                onChangeText={(v) => updateLineItem(li.tempId, "description", v)}
                placeholder="Description..."
                placeholderTextColor={C.textTertiary}
              />
              <View style={styles.lineQtyRow}>
                <View style={styles.lineQtyField}>
                  <Text style={[styles.lineQtyLabel, { color: C.textSecondary }]}>Unit</Text>
                  <TextInput
                    style={[styles.lineNumInput, { color: C.text, borderColor: C.border, backgroundColor: C.surface }]}
                    value={li.unit}
                    onChangeText={(v) => updateLineItem(li.tempId, "unit", v)}
                    placeholder="each"
                    placeholderTextColor={C.textTertiary}
                  />
                </View>
                <View style={styles.lineQtyField}>
                  <Text style={[styles.lineQtyLabel, { color: C.textSecondary }]}>Qty</Text>
                  <TextInput
                    style={[styles.lineNumInput, { color: C.text, borderColor: C.border, backgroundColor: C.surface }]}
                    value={li.quantity}
                    onChangeText={(v) => updateLineItem(li.tempId, "quantity", v)}
                    keyboardType="decimal-pad"
                    placeholder="1"
                    placeholderTextColor={C.textTertiary}
                  />
                </View>
                <View style={styles.lineQtyField}>
                  <Text style={[styles.lineQtyLabel, { color: C.textSecondary }]}>Price ($)</Text>
                  <TextInput
                    style={[styles.lineNumInput, { color: C.text, borderColor: C.border, backgroundColor: C.surface }]}
                    value={li.unitPrice}
                    onChangeText={(v) => updateLineItem(li.tempId, "unitPrice", v)}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={C.textTertiary}
                  />
                </View>
              </View>
              <Text style={[styles.lineSubtotalPreview, { color: C.textSecondary }]}>
                Subtotal: ${((parseFloat(li.quantity) || 0) * (parseFloat(li.unitPrice) || 0)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          ))}

          <View style={[styles.totalRow, { borderTopColor: C.border }]}>
            <Text style={[styles.totalLabel, { color: C.textSecondary }]}>Total</Text>
            <Text style={[styles.totalValue, { color: C.text }]}>
              ${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <SimpleField label="Expiry Date (optional)" value={expiryDate} onChangeText={setExpiryDate} placeholder="YYYY-MM-DD" C={C} />
          <SimpleField label="Notes" value={notes} onChangeText={setNotes} placeholder="Additional notes for the customer..." multiline C={C} />
        </View>
      </ScrollView>
    </View>
  );
}

function SimpleField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  C,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address";
  multiline?: boolean;
  C: typeof import("@/constants/colors").default.light;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: C.textSecondary }]}>{label}</Text>
      <TextInput
        style={[
          styles.fieldInput,
          { color: C.text, backgroundColor: C.surfaceSecondary, borderColor: C.border },
          multiline && { height: 72, textAlignVertical: "top", paddingTop: 10 },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.textTertiary}
        keyboardType={keyboardType}
        multiline={multiline}
        autoCapitalize={keyboardType === "email-address" ? "none" : "sentences"}
        autoCorrect={!keyboardType}
      />
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
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 60,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  scroll: { padding: 16, gap: 14 },
  section: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
  customerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  customerInfo: { flex: 1, gap: 2 },
  customerName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  customerEmail: { fontSize: 12, fontFamily: "Inter_400Regular" },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  addItemBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  addItemBtnText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  lineItemCard: { borderRadius: 12, padding: 12, borderWidth: 1, gap: 8 },
  lineItemTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  lineItemNum: { fontSize: 12, fontFamily: "Inter_500Medium" },
  lineDesc: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  lineQtyRow: { flexDirection: "row", gap: 8 },
  lineQtyField: { flex: 1, gap: 4 },
  lineQtyLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  lineNumInput: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  lineSubtotalPreview: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "right" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
  },
  totalLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  totalValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  field: { gap: 5 },
  fieldLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  fieldInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
});
