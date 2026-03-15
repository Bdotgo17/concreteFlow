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
import { useApp, type Job } from "@/context/AppContext";

const JOB_TYPES: Job["jobType"][] = [
  "full-time",
  "part-time",
  "contract",
  "remote",
  "hybrid",
];

const JOB_TYPE_LABELS: Record<Job["jobType"], string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  remote: "Remote",
  hybrid: "Hybrid",
};

const STATUS_OPTIONS = [
  { value: "saved" as const, label: "Saved" },
  { value: "applied" as const, label: "Applied" },
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
    <View style={fieldStyles.container}>
      <Text style={[fieldStyles.label, { color: C.textSecondary }]}>
        {label}
        {required && <Text style={{ color: C.error }}> *</Text>}
      </Text>
      {children}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  container: { gap: 6 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium" },
});

export default function AddJobScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { addJob } = useApp();

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [jobType, setJobType] = useState<Job["jobType"]>("full-time");
  const [status, setStatus] = useState<"saved" | "applied">("applied");
  const [errors, setErrors] = useState<{ title?: string; company?: string }>({});

  const validate = () => {
    const e: { title?: string; company?: string } = {};
    if (!title.trim()) e.title = "Job title is required";
    if (!company.trim()) e.company = "Company is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addJob({
      title: title.trim(),
      company: company.trim(),
      location: location.trim() || "Remote",
      salary: salary.trim() || undefined,
      jobType,
      status,
      url: url.trim() || undefined,
      notes: notes.trim() || undefined,
      appliedDate:
        status === "applied" ? new Date().toISOString() : undefined,
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
          { paddingTop: topPad + 8, backgroundColor: C.background, borderBottomColor: C.border },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Feather name="x" size={22} color={C.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: C.text }]}>Add Job</Text>
        <Pressable
          style={[styles.submitBtn, { backgroundColor: C.tint }]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitBtnText}>Save</Text>
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
        <Field label="Job Title" required>
          <TextInput
            style={[inputStyle, errors.title && { borderColor: C.error }]}
            placeholder="e.g. Senior Software Engineer"
            placeholderTextColor={C.textTertiary}
            value={title}
            onChangeText={(t) => {
              setTitle(t);
              if (errors.title) setErrors((e) => ({ ...e, title: undefined }));
            }}
            returnKeyType="next"
          />
          {errors.title && (
            <Text style={[styles.errorText, { color: C.error }]}>
              {errors.title}
            </Text>
          )}
        </Field>

        <Field label="Company" required>
          <TextInput
            style={[inputStyle, errors.company && { borderColor: C.error }]}
            placeholder="e.g. Stripe"
            placeholderTextColor={C.textTertiary}
            value={company}
            onChangeText={(t) => {
              setCompany(t);
              if (errors.company) setErrors((e) => ({ ...e, company: undefined }));
            }}
            returnKeyType="next"
          />
          {errors.company && (
            <Text style={[styles.errorText, { color: C.error }]}>
              {errors.company}
            </Text>
          )}
        </Field>

        <Field label="Location">
          <TextInput
            style={inputStyle}
            placeholder="e.g. San Francisco, CA or Remote"
            placeholderTextColor={C.textTertiary}
            value={location}
            onChangeText={setLocation}
            returnKeyType="next"
          />
        </Field>

        <Field label="Salary">
          <TextInput
            style={inputStyle}
            placeholder="e.g. $120k–$160k"
            placeholderTextColor={C.textTertiary}
            value={salary}
            onChangeText={setSalary}
            returnKeyType="next"
          />
        </Field>

        <Field label="Job Type">
          <View style={styles.chipRow}>
            {JOB_TYPES.map((type) => (
              <Pressable
                key={type}
                style={[
                  styles.typeChip,
                  {
                    backgroundColor:
                      jobType === type
                        ? C.tint
                        : isDark
                        ? C.surfaceSecondary
                        : "#F3F4F6",
                  },
                ]}
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.selectionAsync();
                  setJobType(type);
                }}
              >
                <Text
                  style={[
                    styles.typeChipText,
                    { color: jobType === type ? "#fff" : C.textSecondary },
                  ]}
                >
                  {JOB_TYPE_LABELS[type]}
                </Text>
              </Pressable>
            ))}
          </View>
        </Field>

        <Field label="Status">
          <View style={styles.chipRow}>
            {STATUS_OPTIONS.map((s) => (
              <Pressable
                key={s.value}
                style={[
                  styles.typeChip,
                  {
                    backgroundColor:
                      status === s.value
                        ? C.tint
                        : isDark
                        ? C.surfaceSecondary
                        : "#F3F4F6",
                  },
                ]}
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.selectionAsync();
                  setStatus(s.value);
                }}
              >
                <Text
                  style={[
                    styles.typeChipText,
                    { color: status === s.value ? "#fff" : C.textSecondary },
                  ]}
                >
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Field>

        <Field label="Job URL">
          <TextInput
            style={inputStyle}
            placeholder="https://..."
            placeholderTextColor={C.textTertiary}
            value={url}
            onChangeText={setUrl}
            keyboardType="url"
            autoCapitalize="none"
            returnKeyType="next"
          />
        </Field>

        <Field label="Notes">
          <TextInput
            style={[inputStyle, styles.notesInput]}
            placeholder="Interview prep, recruiter contact, deadlines..."
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
          onPress={handleSubmit}
        >
          <Feather name="check" size={18} color="#fff" />
          <Text style={styles.submitLargeText}>Add Application</Text>
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
  submitBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  scroll: {
    padding: 20,
    gap: 20,
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
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  typeChipText: {
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
