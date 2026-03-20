import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Linking,
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

const RELATIONSHIP_CONFIG: Record<
  ContactRelationship,
  { label: string; icon: keyof typeof Feather.glyphMap; color: string }
> = {
  recruiter: { label: "Recruiter", icon: "search", color: "#1B4FFF" },
  "hiring-manager": { label: "Hiring Manager", icon: "user-check", color: "#7C3AED" },
  colleague: { label: "Colleague", icon: "users", color: "#059669" },
  mentor: { label: "Mentor", icon: "award", color: "#D97706" },
  referral: { label: "Referral", icon: "share-2", color: "#DB2777" },
  friend: { label: "Friend", icon: "heart", color: "#0891B2" },
  other: { label: "Other", icon: "more-horizontal", color: "#6B7280" },
};

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function formatDate(iso?: string) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ActionButton({
  icon,
  label,
  color,
  bg,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  color: string;
  bg: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionBtn,
        { backgroundColor: bg, opacity: pressed ? 0.8 : 1 },
      ]}
      onPress={onPress}
    >
      <Feather name={icon} size={20} color={color} />
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

export default function ContactDetailScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { contacts, updateContact, deleteContact } = useApp();
  const contact = contacts.find((c) => c.id === id);
  const [notes, setNotes] = useState(contact?.notes ?? "");
  const [editingNotes, setEditingNotes] = useState(false);

  if (!contact) {
    return (
      <View style={[styles.container, { backgroundColor: C.background }]}>
        <Text style={{ color: C.text, padding: 20 }}>Contact not found</Text>
      </View>
    );
  }

  const rel = RELATIONSHIP_CONFIG[contact.relationship];
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleDelete = () => {
    if (Platform.OS === "web") {
      deleteContact(contact.id);
      router.back();
      return;
    }
    Alert.alert("Remove Contact", `Remove ${contact.name} from your network?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          deleteContact(contact.id);
          router.back();
        },
      },
    ]);
  };

  const handleEmail = () => {
    if (contact.email) {
      Linking.openURL(`mailto:${contact.email}?subject=Following Up`);
      updateContact(contact.id, { lastContactedAt: new Date().toISOString() });
    }
  };

  const handleCall = () => {
    if (contact.phone) {
      Linking.openURL(`tel:${contact.phone}`);
      updateContact(contact.id, { lastContactedAt: new Date().toISOString() });
    }
  };

  const handleLinkedIn = () => {
    if (contact.linkedIn) {
      Linking.openURL(contact.linkedIn);
    }
  };

  const handleSaveNotes = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateContact(contact.id, { notes });
    setEditingNotes(false);
  };

  const handleMarkContacted = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateContact(contact.id, { lastContactedAt: new Date().toISOString() });
  };

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
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
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: C.text }]}>Contact</Text>
        <Pressable onPress={handleDelete}>
          <Feather name="trash-2" size={20} color={C.error} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: 40 + insets.bottom }]}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={[styles.avatar, { backgroundColor: contact.avatarColor }]}>
            <Text style={styles.avatarText}>{getInitials(contact.name)}</Text>
          </View>
          <Text style={[styles.contactName, { color: C.text }]}>{contact.name}</Text>
          <Text style={[styles.contactRole, { color: C.textSecondary }]}>
            {contact.role} · {contact.company}
          </Text>
          <View
            style={[
              styles.relBadge,
              { backgroundColor: isDark ? "#0C1A3F" : "#EEF3FF" },
            ]}
          >
            <Feather name={rel.icon} size={13} color={rel.color} />
            <Text style={[styles.relText, { color: rel.color }]}>{rel.label}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actions}>
          {contact.email && (
            <ActionButton
              icon="mail"
              label="Email"
              color={C.tint}
              bg={isDark ? "#0C1A3F" : "#EEF3FF"}
              onPress={handleEmail}
            />
          )}
          {contact.phone && (
            <ActionButton
              icon="phone"
              label="Call"
              color={C.success}
              bg={isDark ? "#052E16" : "#ECFDF5"}
              onPress={handleCall}
            />
          )}
          {contact.linkedIn && (
            <ActionButton
              icon="linkedin"
              label="LinkedIn"
              color="#0A66C2"
              bg={isDark ? "#051526" : "#E8F0FE"}
              onPress={handleLinkedIn}
            />
          )}
          <ActionButton
            icon="check-circle"
            label="Contacted"
            color={C.warning}
            bg={isDark ? "#1C1107" : "#FFFBEB"}
            onPress={handleMarkContacted}
          />
        </View>

        {/* Info Card */}
        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[styles.cardTitle, { color: C.text }]}>Details</Text>

          {contact.email && (
            <View style={styles.detailRow}>
              <View style={[styles.detailIcon, { backgroundColor: isDark ? C.surfaceSecondary : "#EEF3FF" }]}>
                <Feather name="mail" size={14} color={C.tint} />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: C.textSecondary }]}>Email</Text>
                <Text style={[styles.detailValue, { color: C.text }]}>{contact.email}</Text>
              </View>
            </View>
          )}

          {contact.phone && (
            <View style={styles.detailRow}>
              <View style={[styles.detailIcon, { backgroundColor: isDark ? C.surfaceSecondary : "#EEF3FF" }]}>
                <Feather name="phone" size={14} color={C.tint} />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: C.textSecondary }]}>Phone</Text>
                <Text style={[styles.detailValue, { color: C.text }]}>{contact.phone}</Text>
              </View>
            </View>
          )}

          {contact.linkedIn && (
            <View style={styles.detailRow}>
              <View style={[styles.detailIcon, { backgroundColor: isDark ? C.surfaceSecondary : "#EEF3FF" }]}>
                <Feather name="linkedin" size={14} color={C.tint} />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: C.textSecondary }]}>LinkedIn</Text>
                <Text style={[styles.detailValue, { color: C.tint }]} numberOfLines={1}>{contact.linkedIn}</Text>
              </View>
            </View>
          )}

          <View style={styles.detailRow}>
            <View style={[styles.detailIcon, { backgroundColor: isDark ? C.surfaceSecondary : "#EEF3FF" }]}>
              <Feather name="calendar" size={14} color={C.tint} />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: C.textSecondary }]}>Last Contacted</Text>
              <Text style={[styles.detailValue, { color: C.text }]}>
                {formatDate(contact.lastContactedAt)}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={[styles.detailIcon, { backgroundColor: isDark ? C.surfaceSecondary : "#EEF3FF" }]}>
              <Feather name="plus-circle" size={14} color={C.tint} />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: C.textSecondary }]}>Added</Text>
              <Text style={[styles.detailValue, { color: C.text }]}>
                {formatDate(contact.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={styles.notesHeader}>
            <Text style={[styles.cardTitle, { color: C.text }]}>Notes</Text>
            {!editingNotes && (
              <Pressable onPress={() => setEditingNotes(true)}>
                <Feather name="edit-2" size={16} color={C.tint} />
              </Pressable>
            )}
          </View>

          {editingNotes ? (
            <>
              <TextInput
                style={[
                  styles.notesInput,
                  {
                    color: C.text,
                    borderColor: C.tint,
                    backgroundColor: isDark ? C.surfaceSecondary : "#F9FAFB",
                  },
                ]}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                autoFocus
                placeholder="Add notes about this contact..."
                placeholderTextColor={C.textTertiary}
              />
              <View style={styles.notesActions}>
                <Pressable
                  style={[styles.notesCancelBtn, { borderColor: C.border }]}
                  onPress={() => {
                    setNotes(contact.notes ?? "");
                    setEditingNotes(false);
                  }}
                >
                  <Text style={[styles.notesCancelText, { color: C.textSecondary }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.notesSaveBtn, { backgroundColor: C.tint }]}
                  onPress={handleSaveNotes}
                >
                  <Text style={styles.notesSaveText}>Save</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <Pressable onPress={() => setEditingNotes(true)}>
              <Text
                style={[
                  styles.notesText,
                  { color: notes ? C.text : C.textTertiary },
                ]}
              >
                {notes || "Tap to add notes about this contact..."}
              </Text>
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
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
  scroll: { padding: 16, gap: 14 },
  hero: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarText: {
    color: "#fff",
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  contactName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  contactRole: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  relBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 4,
  },
  relText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  actionBtn: {
    flex: 1,
    minWidth: 72,
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
  },
  actionLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  detailContent: { flex: 1, gap: 1 },
  detailLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  detailValue: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  notesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notesText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  notesInput: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 120,
  },
  notesActions: {
    flexDirection: "row",
    gap: 10,
  },
  notesCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  notesCancelText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  notesSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  notesSaveText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});
