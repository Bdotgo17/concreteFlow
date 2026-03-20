import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import SkillChip from "@/components/SkillChip";

interface ProfileRowProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
}

function ProfileRow({ icon, label, value, onPress }: ProfileRowProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;

  return (
    <Pressable
      style={[styles.row, { borderBottomColor: C.border }]}
      onPress={onPress}
    >
      <View
        style={[styles.rowIcon, { backgroundColor: isDark ? C.surfaceSecondary : "#EEF3FF" }]}
      >
        <Feather name={icon} size={16} color={C.tint} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, { color: C.textSecondary }]}>{label}</Text>
        <Text
          style={[styles.rowValue, { color: value ? C.text : C.textTertiary }]}
          numberOfLines={1}
        >
          {value || "Not set"}
        </Text>
      </View>
      {onPress && <Feather name="chevron-right" size={16} color={C.textTertiary} />}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { profile, updateProfile } = useApp();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const initials = profile.name
    ? profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";
  const profileScore = [
    profile.name,
    profile.email,
    profile.title,
    profile.summary,
    profile.skills.length > 0,
    profile.experience,
    profile.education,
    profile.preferredRoles.length > 0,
  ].filter(Boolean).length;
  const scorePercent = Math.round((profileScore / 8) * 100);

  const handleEdit = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/edit-profile");
  };

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <LinearGradient
        colors={isDark ? ["#0C1A3F", "#080E1A"] : ["#EEF3FF", C.background]}
        style={[styles.hero, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.avatarRow}>
          <View style={[styles.avatar, { backgroundColor: C.tint }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.heroInfo}>
            <Text style={[styles.heroName, { color: C.text }]}>
              {profile.name || "Set your name"}
            </Text>
            <Text style={[styles.heroTitle, { color: C.textSecondary }]}>
              {profile.title || "Add your job title"}
            </Text>
          </View>
          <Pressable
            style={[styles.editBtn, { backgroundColor: C.surface, borderColor: C.border }]}
            onPress={handleEdit}
          >
            <Feather name="edit-2" size={16} color={C.tint} />
          </Pressable>
        </View>

        <View style={[styles.scoreCard, { backgroundColor: isDark ? "rgba(27,79,255,0.12)" : "#EEF3FF" }]}>
          <View style={styles.scoreHeader}>
            <Text style={[styles.scoreLabel, { color: C.text }]}>Profile Strength</Text>
            <Text style={[styles.scoreValue, { color: C.tint }]}>{scorePercent}%</Text>
          </View>
          <View style={[styles.scoreBar, { backgroundColor: isDark ? "#1E2A3A" : "#D1D9FF" }]}>
            <View
              style={[
                styles.scoreBarFill,
                { width: `${scorePercent}%` as any, backgroundColor: C.tint },
              ]}
            />
          </View>
          {scorePercent < 100 && (
            <Text style={[styles.scoreHint, { color: C.textSecondary }]}>
              Complete your profile to unlock all features
            </Text>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: 120 + (Platform.OS === "web" ? 34 : insets.bottom) }]}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Auto-Apply</Text>

          <View style={styles.autoToggleRow}>
            <View style={styles.autoToggleInfo}>
              <Text style={[styles.autoToggleTitle, { color: C.text }]}>Enable Auto-Apply</Text>
              <Text style={[styles.autoToggleSub, { color: C.textSecondary }]}>
                Automatically apply to matching jobs
              </Text>
            </View>
            <Switch
              value={profile.autoApplyEnabled}
              onValueChange={(val) => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                updateProfile({ autoApplyEnabled: val });
              }}
              trackColor={{ false: C.border, true: C.tint }}
              thumbColor="#fff"
            />
          </View>

          {profile.autoApplyEnabled && (
            <View style={[styles.autoInfo, { backgroundColor: isDark ? "#002B27" : "#E6FBF8" }]}>
              <Feather name="zap" size={14} color={C.accent} />
              <Text style={[styles.autoInfoText, { color: C.accent }]}>
                Looking for: {profile.preferredRoles.join(", ") || "Set your preferred roles"}
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Contact</Text>
          <ProfileRow icon="mail" label="Email" value={profile.email} onPress={handleEdit} />
          <ProfileRow icon="phone" label="Phone" value={profile.phone} onPress={handleEdit} />
          <ProfileRow icon="map-pin" label="Location" value={profile.location} onPress={handleEdit} />
        </View>

        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Career</Text>
          <ProfileRow icon="briefcase" label="Experience" value={profile.experience} onPress={handleEdit} />
          <ProfileRow icon="book-open" label="Education" value={profile.education} onPress={handleEdit} />
          <ProfileRow icon="dollar-sign" label="Target Salary" value={
            profile.salaryMin && profile.salaryMax
              ? `$${profile.salaryMin}k – $${profile.salaryMax}k`
              : undefined
          } onPress={handleEdit} />
        </View>

        {profile.skills.length > 0 && (
          <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitle, { color: C.text }]}>Skills</Text>
              <Pressable onPress={handleEdit}>
                <Text style={[styles.editLink, { color: C.tint }]}>Edit</Text>
              </Pressable>
            </View>
            <View style={styles.skillsWrap}>
              {profile.skills.map((skill) => (
                <SkillChip key={skill} label={skill} />
              ))}
            </View>
          </View>
        )}

        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Links</Text>
          <ProfileRow icon="linkedin" label="LinkedIn" value={profile.linkedIn} onPress={handleEdit} />
          <ProfileRow icon="github" label="GitHub" value={profile.github} onPress={handleEdit} />
          <ProfileRow icon="globe" label="Portfolio" value={profile.portfolio} onPress={handleEdit} />
        </View>

        <Pressable
          style={[styles.editProfileBtn, { backgroundColor: C.tint }]}
          onPress={handleEdit}
        >
          <Feather name="edit-2" size={16} color="#fff" />
          <Text style={styles.editProfileBtnText}>Edit Profile</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  heroInfo: { flex: 1, gap: 2 },
  heroName: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  heroTitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  scoreCard: {
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  scoreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  scoreValue: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  scoreBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  scoreBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  scoreHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  scroll: {
    padding: 16,
    gap: 12,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editLink: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  autoToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  autoToggleInfo: { flex: 1, gap: 2 },
  autoToggleTitle: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  autoToggleSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  autoInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
    padding: 10,
  },
  autoInfoText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowContent: { flex: 1, gap: 1 },
  rowLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  rowValue: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  editProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 4,
  },
  editProfileBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
