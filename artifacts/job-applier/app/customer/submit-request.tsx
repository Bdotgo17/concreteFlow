import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

export default function SubmitRequestScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { createQuoteRequest } = useApp();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [desiredDate, setDesiredDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleSubmit = async () => {
    if (!name.trim() || !description.trim()) {
      Alert.alert("Missing info", "Please fill in your name and project description.");
      return;
    }
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);
    try {
      await createQuoteRequest({
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim() || undefined,
        customerAddress: address.trim() || undefined,
        projectDescription: description.trim(),
        desiredDate: desiredDate.trim() || undefined,
      });
      setSubmitted(true);
    } catch {
      Alert.alert("Error", "Failed to submit your request. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (submitted) {
    return (
      <View style={[styles.container, { backgroundColor: C.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: C.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="x" size={22} color={C.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: C.text }]}>Request Submitted</Text>
          <View style={{ width: 30 }} />
        </View>
        <View style={styles.successContainer}>
          <View style={[styles.successIcon, { backgroundColor: C.successSoft }]}>
            <Feather name="check-circle" size={48} color={C.success} />
          </View>
          <Text style={[styles.successTitle, { color: C.text }]}>Request Sent!</Text>
          <Text style={[styles.successSub, { color: C.textSecondary }]}>
            Thank you, {name}. We've received your request and will reach out within 24 hours with a free estimate.
          </Text>
          <Pressable
            style={[styles.doneBtn, { backgroundColor: C.tint }]}
            onPress={() => router.back()}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: C.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="x" size={22} color={C.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: C.text }]}>Request a Quote</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 40 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.introText, { color: C.textSecondary }]}>
          Fill out the form below and we'll prepare a free, no-obligation quote for your concrete project.
        </Text>

        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Your Contact Info</Text>
          <Field label="Full Name *" value={name} onChangeText={setName} placeholder="John Smith" C={C} />
          <Field label="Email Address" value={email} onChangeText={setEmail} placeholder="john@email.com" keyboardType="email-address" C={C} />
          <Field label="Phone Number" value={phone} onChangeText={setPhone} placeholder="555-1234" keyboardType="phone-pad" C={C} />
        </View>

        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Project Details</Text>
          <Field
            label="Project Description *"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe what you need (e.g., 2-car concrete driveway, 40ft long)..."
            multiline
            numberOfLines={4}
            C={C}
          />
          <Field label="Site Address" value={address} onChangeText={setAddress} placeholder="123 Main St, City, State" C={C} />
          <Field
            label="Desired Start Date"
            value={desiredDate}
            onChangeText={setDesiredDate}
            placeholder="YYYY-MM-DD"
            C={C}
          />
        </View>

        <Pressable
          style={[styles.submitBtn, { backgroundColor: saving ? C.border : C.tint }]}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Feather name="send" size={18} color="#fff" />
              <Text style={styles.submitBtnText}>Submit Request</Text>
            </>
          )}
        </Pressable>

        <Text style={[styles.disclaimer, { color: C.textTertiary }]}>
          We will never share your information with third parties. Free estimates with no obligation.
        </Text>
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
          multiline && { height: 88, textAlignVertical: "top", paddingTop: 10 },
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
  introText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
    paddingHorizontal: 4,
  },
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
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 4,
  },
  submitBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  disclaimer: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 17 },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 16,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: { fontSize: 24, fontFamily: "Inter_700Bold", textAlign: "center" },
  successSub: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  doneBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  doneBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
