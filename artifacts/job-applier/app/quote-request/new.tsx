import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

export default function NewQuoteRequestScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { createQuoteRequest } = useApp();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [desiredDate, setDesiredDate] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleSave = async () => {
    if (!customerName.trim() || !projectDescription.trim()) {
      Alert.alert("Missing info", "Please fill in customer name and project description.");
      return;
    }
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);
    try {
      await createQuoteRequest({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim() || undefined,
        customerAddress: address.trim() || undefined,
        projectDescription: projectDescription.trim(),
        desiredDate: desiredDate.trim() || undefined,
      });
      router.back();
    } catch {
      Alert.alert("Error", "Failed to create quote request. Please try again.");
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
        <Text style={[styles.headerTitle, { color: C.text }]}>New Request</Text>
        <Pressable
          style={[styles.saveBtn, { backgroundColor: saving ? C.border : C.tint }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 40 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Customer Info</Text>
          <Field label="Full Name *" value={customerName} onChangeText={setCustomerName} placeholder="John Smith" C={C} />
          <Field label="Email" value={customerEmail} onChangeText={setCustomerEmail} placeholder="john@email.com" keyboardType="email-address" C={C} />
          <Field label="Phone" value={customerPhone} onChangeText={setCustomerPhone} placeholder="555-1234" keyboardType="phone-pad" C={C} />
        </View>

        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Project Details</Text>
          <Field
            label="Project Description *"
            value={projectDescription}
            onChangeText={setProjectDescription}
            placeholder="Describe the work needed..."
            multiline
            numberOfLines={4}
            C={C}
          />
          <Field label="Site Address" value={address} onChangeText={setAddress} placeholder="123 Main St, City, State" C={C} />
          <Field label="Desired Date" value={desiredDate} onChangeText={setDesiredDate} placeholder="YYYY-MM-DD" C={C} />
        </View>
      </ScrollView>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  numberOfLines,
  C,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  multiline?: boolean;
  numberOfLines?: number;
  C: typeof import("@/constants/colors").default.light;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: C.textSecondary }]}>{label}</Text>
      <TextInput
        style={[
          styles.fieldInput,
          { color: C.text, backgroundColor: C.surfaceSecondary, borderColor: C.border },
          multiline && { height: 80, textAlignVertical: "top", paddingTop: 10 },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.textTertiary}
        keyboardType={keyboardType ?? "default"}
        multiline={multiline}
        numberOfLines={numberOfLines}
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
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 60,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  scroll: { padding: 16, gap: 14 },
  section: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 14 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
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
