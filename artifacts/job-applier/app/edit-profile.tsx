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
  Switch,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

interface FieldProps {
  label: string;
  children: React.ReactNode;
}
function Field({ label, children }: FieldProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  return (
    <View style={fStyles.container}>
      <Text style={[fStyles.label, { color: C.textSecondary }]}>{label}</Text>
      {children}
    </View>
  );
}
const fStyles = StyleSheet.create({
  container: { gap: 6 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium" },
});

function SectionTitle({ title }: { title: string }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  return (
    <Text style={[styles.sectionTitle, { color: C.text, borderBottomColor: C.border }]}>
      {title}
    </Text>
  );
}

export default function EditProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { profile, updateProfile } = useApp();

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [location, setLocation] = useState(profile.location);
  const [title, setTitle] = useState(profile.title);
  const [summary, setSummary] = useState(profile.summary);
  const [experience, setExperience] = useState(profile.experience);
  const [education, setEducation] = useState(profile.education);
  const [linkedIn, setLinkedIn] = useState(profile.linkedIn ?? "");
  const [github, setGithub] = useState(profile.github ?? "");
  const [portfolio, setPortfolio] = useState(profile.portfolio ?? "");
  const [salaryMin, setSalaryMin] = useState(profile.salaryMin ?? "");
  const [salaryMax, setSalaryMax] = useState(profile.salaryMax ?? "");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>(profile.skills);
  const [roleInput, setRoleInput] = useState("");
  const [preferredRoles, setPreferredRoles] = useState<string[]>(profile.preferredRoles);
  const [remoteOnly, setRemoteOnly] = useState(profile.remoteOnly);
  const [autoApplyEnabled, setAutoApplyEnabled] = useState(profile.autoApplyEnabled);

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setSkillInput("");
  };

  const removeSkill = (s: string) => setSkills((prev) => prev.filter((x) => x !== s));

  const addRole = () => {
    const trimmed = roleInput.trim();
    if (trimmed && !preferredRoles.includes(trimmed)) {
      setPreferredRoles((prev) => [...prev, trimmed]);
    }
    setRoleInput("");
  };

  const removeRole = (r: string) => setPreferredRoles((prev) => prev.filter((x) => x !== r));

  const handleSave = () => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateProfile({
      name,
      email,
      phone,
      location,
      title,
      summary,
      experience,
      education,
      linkedIn: linkedIn || undefined,
      github: github || undefined,
      portfolio: portfolio || undefined,
      salaryMin: salaryMin || undefined,
      salaryMax: salaryMax || undefined,
      skills,
      preferredRoles,
      remoteOnly,
      autoApplyEnabled,
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
        <Text style={[styles.headerTitle, { color: C.text }]}>Edit Profile</Text>
        <Pressable style={[styles.saveBtn, { backgroundColor: C.tint }]} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: 40 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
      >
        <SectionTitle title="Personal Info" />

        <Field label="Full Name">
          <TextInput style={inputStyle} value={name} onChangeText={setName}
            placeholder="Jane Doe" placeholderTextColor={C.textTertiary} />
        </Field>
        <Field label="Job Title">
          <TextInput style={inputStyle} value={title} onChangeText={setTitle}
            placeholder="Senior Software Engineer" placeholderTextColor={C.textTertiary} />
        </Field>
        <Field label="Email">
          <TextInput style={inputStyle} value={email} onChangeText={setEmail}
            placeholder="jane@example.com" placeholderTextColor={C.textTertiary}
            keyboardType="email-address" autoCapitalize="none" />
        </Field>
        <Field label="Phone">
          <TextInput style={inputStyle} value={phone} onChangeText={setPhone}
            placeholder="+1 (555) 123-4567" placeholderTextColor={C.textTertiary}
            keyboardType="phone-pad" />
        </Field>
        <Field label="Location">
          <TextInput style={inputStyle} value={location} onChangeText={setLocation}
            placeholder="San Francisco, CA" placeholderTextColor={C.textTertiary} />
        </Field>

        <SectionTitle title="Professional Summary" />

        <Field label="Summary">
          <TextInput style={[inputStyle, styles.tall]} value={summary} onChangeText={setSummary}
            placeholder="Brief professional summary..." placeholderTextColor={C.textTertiary}
            multiline numberOfLines={4} textAlignVertical="top" />
        </Field>
        <Field label="Experience">
          <TextInput style={inputStyle} value={experience} onChangeText={setExperience}
            placeholder="e.g. 5 years" placeholderTextColor={C.textTertiary} />
        </Field>
        <Field label="Education">
          <TextInput style={inputStyle} value={education} onChangeText={setEducation}
            placeholder="e.g. BS Computer Science, MIT" placeholderTextColor={C.textTertiary} />
        </Field>

        <SectionTitle title="Skills" />

        <Field label="Add Skill">
          <View style={styles.addRow}>
            <TextInput
              style={[inputStyle, { flex: 1 }]}
              value={skillInput}
              onChangeText={setSkillInput}
              placeholder="e.g. React Native"
              placeholderTextColor={C.textTertiary}
              onSubmitEditing={addSkill}
              returnKeyType="done"
            />
            <Pressable
              style={[styles.addBtn, { backgroundColor: C.tint }]}
              onPress={addSkill}
            >
              <Feather name="plus" size={18} color="#fff" />
            </Pressable>
          </View>
        </Field>

        {skills.length > 0 && (
          <View style={styles.chipsWrap}>
            {skills.map((s) => (
              <Pressable
                key={s}
                style={[styles.chip, { backgroundColor: isDark ? "#0C1A3F" : "#EEF3FF" }]}
                onPress={() => removeSkill(s)}
              >
                <Text style={[styles.chipText, { color: C.tint }]}>{s}</Text>
                <Feather name="x" size={12} color={C.tint} />
              </Pressable>
            ))}
          </View>
        )}

        <SectionTitle title="Job Preferences" />

        <Field label="Preferred Role">
          <View style={styles.addRow}>
            <TextInput
              style={[inputStyle, { flex: 1 }]}
              value={roleInput}
              onChangeText={setRoleInput}
              placeholder="e.g. Frontend Engineer"
              placeholderTextColor={C.textTertiary}
              onSubmitEditing={addRole}
              returnKeyType="done"
            />
            <Pressable
              style={[styles.addBtn, { backgroundColor: C.tint }]}
              onPress={addRole}
            >
              <Feather name="plus" size={18} color="#fff" />
            </Pressable>
          </View>
        </Field>

        {preferredRoles.length > 0 && (
          <View style={styles.chipsWrap}>
            {preferredRoles.map((r) => (
              <Pressable
                key={r}
                style={[styles.chip, { backgroundColor: isDark ? "#0C1A3F" : "#EEF3FF" }]}
                onPress={() => removeRole(r)}
              >
                <Text style={[styles.chipText, { color: C.tint }]}>{r}</Text>
                <Feather name="x" size={12} color={C.tint} />
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.twoCol}>
          <Field label="Min Salary ($k)">
            <TextInput style={[inputStyle, { flex: 1 }]} value={salaryMin}
              onChangeText={setSalaryMin} placeholder="120" placeholderTextColor={C.textTertiary}
              keyboardType="numeric" />
          </Field>
          <Field label="Max Salary ($k)">
            <TextInput style={[inputStyle, { flex: 1 }]} value={salaryMax}
              onChangeText={setSalaryMax} placeholder="180" placeholderTextColor={C.textTertiary}
              keyboardType="numeric" />
          </Field>
        </View>

        <View style={[styles.toggleRow, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={styles.toggleInfo}>
            <Text style={[styles.toggleTitle, { color: C.text }]}>Remote Only</Text>
            <Text style={[styles.toggleSub, { color: C.textSecondary }]}>Filter to remote positions</Text>
          </View>
          <Switch value={remoteOnly} onValueChange={setRemoteOnly}
            trackColor={{ false: C.border, true: C.tint }} thumbColor="#fff" />
        </View>

        <View style={[styles.toggleRow, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={styles.toggleInfo}>
            <Text style={[styles.toggleTitle, { color: C.text }]}>Auto-Apply</Text>
            <Text style={[styles.toggleSub, { color: C.textSecondary }]}>Automatically apply to matching jobs</Text>
          </View>
          <Switch value={autoApplyEnabled} onValueChange={setAutoApplyEnabled}
            trackColor={{ false: C.border, true: C.tint }} thumbColor="#fff" />
        </View>

        <SectionTitle title="Online Profiles" />

        <Field label="LinkedIn URL">
          <TextInput style={inputStyle} value={linkedIn} onChangeText={setLinkedIn}
            placeholder="https://linkedin.com/in/..." placeholderTextColor={C.textTertiary}
            keyboardType="url" autoCapitalize="none" />
        </Field>
        <Field label="GitHub URL">
          <TextInput style={inputStyle} value={github} onChangeText={setGithub}
            placeholder="https://github.com/..." placeholderTextColor={C.textTertiary}
            keyboardType="url" autoCapitalize="none" />
        </Field>
        <Field label="Portfolio URL">
          <TextInput style={inputStyle} value={portfolio} onChangeText={setPortfolio}
            placeholder="https://yoursite.com" placeholderTextColor={C.textTertiary}
            keyboardType="url" autoCapitalize="none" />
        </Field>

        <Pressable style={[styles.submitLarge, { backgroundColor: C.tint }]} onPress={handleSave}>
          <Feather name="check" size={18} color="#fff" />
          <Text style={styles.submitLargeText}>Save Profile</Text>
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
  saveBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  scroll: { padding: 20, gap: 16 },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  tall: { minHeight: 100, textAlignVertical: "top" },
  addRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  addBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  twoCol: {
    flexDirection: "row",
    gap: 12,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  toggleInfo: { flex: 1, gap: 2 },
  toggleTitle: { fontSize: 15, fontFamily: "Inter_500Medium" },
  toggleSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  submitLarge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 4,
  },
  submitLargeText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
