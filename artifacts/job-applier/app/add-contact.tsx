import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
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
import { useApp, type ContactRelationship } from "@/context/AppContext";

const RELATIONSHIP_OPTIONS: { value: ContactRelationship; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { value: "recruiter", label: "Recruiter", icon: "search" },
  { value: "hiring-manager", label: "Hiring Manager", icon: "user-check" },
  { value: "referral", label: "Referral", icon: "share-2" },
  { value: "mentor", label: "Mentor", icon: "award" },
  { value: "colleague", label: "Colleague", icon: "users" },
  { value: "friend", label: "Friend", icon: "heart" },
  { value: "other", label: "Other", icon: "more-horizontal" },
];

interface FieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

function Field({ label, required, children }: FieldProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  return (
    <View style={fStyles.container}>
      <Text style={[fStyles.label, { color: C.textSecondary }]}>
        {label}
        {required && <Text style={{ color: C.error }}> *</Text>}
      </Text>
      {children}
    </View>
  );
}
const fStyles = StyleSheet.create({
  container: { gap: 6 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium" },
});

export default function AddContactScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { addContact } = useApp();

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [relationship, setRelationship] = useState<ContactRelationship>("recruiter");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<{ name?: string; company?: string }>({});

  const validate = () => {
    const e: { name?: string; company?: string } = {};
    if (!name.trim()) e.name = "Name is required";
    if (!company.trim()) e.company = "Company is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addContact({
      name: name.trim(),
      company: company.trim(),
      role: role.trim() || "Unknown Role",
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      linkedIn: linkedIn.trim() || undefined,
      relationship,
      notes: notes.trim() || undefined,
    });
    router.back();
  };

  const inputStyle = [
    styles.input,
    {
      color: C.text,
      backgroundColor: isDark ? C.surfaceSecondary : "#F9FAFB",
      borderColor: C.border,
    },
  ];

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: C.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 8,
            backgroundColor: C.background,
            borderBottomColor: C.border,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Feather name="x" size={22} color={C.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: C.text }]}>Add Contact</Text>
        <Pressable
          style={[styles.saveBtn, { backgroundColor: C.tint }]}
          onPress={handleSave}
        >
          <Text style={styles.saveBtnText}>Save</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: 40 + insets.bottom },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar preview */}
        <View style={styles.avatarPreview}>
          <View style={[styles.avatar, { backgroundColor: C.tint }]}>
            <Text style={styles.avatarText}>
              {name
                ? name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
                : "?"}
            </Text>
          </View>
          <Text style={[styles.avatarHint, { color: C.textSecondary }]}>
            Avatar generated from name
          </Text>
        </View>

        <Field label="Full Name" required>
          <TextInput
            style={[inputStyle, errors.name && { borderColor: C.error }]}
            placeholder="e.g. Sarah Johnson"
            placeholderTextColor={C.textTertiary}
            value={name}
            onChangeText={(t) => {
              setName(t);
              if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
            }}
            returnKeyType="next"
          />
          {errors.name && (
            <Text style={[styles.errorText, { color: C.error }]}>{errors.name}</Text>
          )}
        </Field>

        <Field label="Company" required>
          <TextInput
            style={[inputStyle, errors.company && { borderColor: C.error }]}
            placeholder="e.g. Google"
            placeholderTextColor={C.textTertiary}
            value={company}
            onChangeText={(t) => {
              setCompany(t);
              if (errors.company) setErrors((e) => ({ ...e, company: undefined }));
            }}
            returnKeyType="next"
          />
          {errors.company && (
            <Text style={[styles.errorText, { color: C.error }]}>{errors.company}</Text>
          )}
        </Field>

        <Field label="Job Title / Role">
          <TextInput
            style={inputStyle}
            placeholder="e.g. Senior Recruiter"
            placeholderTextColor={C.textTertiary}
            value={role}
            onChangeText={setRole}
            returnKeyType="next"
          />
        </Field>

        <Field label="Relationship">
          <View style={styles.relGrid}>
            {RELATIONSHIP_OPTIONS.map((opt) => {
              const isActive = relationship === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  style={[
                    styles.relOption,
                    {
                      backgroundColor: isActive
                        ? C.tint
                        : isDark
                        ? C.surfaceSecondary
                        : "#F3F4F6",
                      borderColor: isActive ? C.tint : C.border,
                    },
                  ]}
                  onPress={() => {
                    if (Platform.OS !== "web") Haptics.selectionAsync();
                    setRelationship(opt.value);
                  }}
                >
                  <Feather
                    name={opt.icon}
                    size={14}
                    color={isActive ? "#fff" : C.textSecondary}
                  />
                  <Text
                    style={[
                      styles.relOptionText,
                      { color: isActive ? "#fff" : C.textSecondary },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Field>

        <Field label="Email">
          <TextInput
            style={inputStyle}
            placeholder="sarah@google.com"
            placeholderTextColor={C.textTertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
          />
        </Field>

        <Field label="Phone">
          <TextInput
            style={inputStyle}
            placeholder="+1 (555) 000-0000"
            placeholderTextColor={C.textTertiary}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </Field>

        <Field label="LinkedIn URL">
          <TextInput
            style={inputStyle}
            placeholder="https://linkedin.com/in/..."
            placeholderTextColor={C.textTertiary}
            value={linkedIn}
            onChangeText={setLinkedIn}
            keyboardType="url"
            autoCapitalize="none"
            returnKeyType="next"
          />
        </Field>

        <Field label="Notes">
          <TextInput
            style={[inputStyle, styles.notesInput]}
            placeholder="How you met, topics discussed, follow-up items..."
            placeholderTextColor={C.textTertiary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </Field>

        <Pressable
          style={[styles.submitLarge, { backgroundColor: C.tint }]}
          onPress={handleSave}
        >
          <Feather name="user-plus" size={18} color="#fff" />
          <Text style={styles.submitLargeText}>Add to Network</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  scroll: {
    padding: 20,
    gap: 20,
  },
  avatarPreview: {
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  avatarHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  notesInput: {
    minHeight: 100,
  },
  relGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  relOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  relOptionText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  submitLarge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 4,
  },
  submitLargeText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
