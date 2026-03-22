import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

export default function CustomerScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <LinearGradient
        colors={isDark ? ["#1A0F00", "#0F0A06"] : ["#FEF3C7", C.background]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Text style={[styles.title, { color: C.text }]}>Customer Portal</Text>
        <Text style={[styles.subtitle, { color: C.textSecondary }]}>
          Submit a request or view your quote and invoice
        </Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 120 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={[styles.heroBanner, { backgroundColor: isDark ? C.surfaceSecondary : C.concreteSoft, borderColor: C.border }]}>
          <View style={[styles.heroIcon, { backgroundColor: C.tint }]}>
            <Feather name="hard-drive" size={28} color="#fff" />
          </View>
          <Text style={[styles.heroTitle, { color: C.text }]}>Quality Concrete Work</Text>
          <Text style={[styles.heroSub, { color: C.textSecondary }]}>
            Driveways, patios, foundations, and more. Get a free quote today.
          </Text>
        </View>

        <View style={styles.actionsSection}>
          <Pressable
            style={[styles.actionCard, { backgroundColor: C.surface, borderColor: C.border }]}
            onPress={() => router.push("/customer/submit-request")}
          >
            <View style={[styles.actionIcon, { backgroundColor: C.infoSoft }]}>
              <Feather name="send" size={22} color={C.info} />
            </View>
            <View style={styles.actionText}>
              <Text style={[styles.actionTitle, { color: C.text }]}>Submit a Quote Request</Text>
              <Text style={[styles.actionDesc, { color: C.textSecondary }]}>
                Tell us about your project and we'll prepare a free estimate
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={C.textTertiary} />
          </Pressable>

          <Pressable
            style={[styles.actionCard, { backgroundColor: C.surface, borderColor: C.border }]}
            onPress={() => router.push("/customer/view-quote")}
          >
            <View style={[styles.actionIcon, { backgroundColor: C.warningSoft }]}>
              <Feather name="file-text" size={22} color={C.tint} />
            </View>
            <View style={styles.actionText}>
              <Text style={[styles.actionTitle, { color: C.text }]}>View My Quote</Text>
              <Text style={[styles.actionDesc, { color: C.textSecondary }]}>
                Review your quote, line items, and total cost
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={C.textTertiary} />
          </Pressable>
        </View>

        <View style={[styles.infoSection, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[styles.infoTitle, { color: C.text }]}>How it works</Text>
          {[
            { icon: "edit-3" as const, step: "1", label: "Submit your request", desc: "Fill out a short form with project details" },
            { icon: "phone" as const, step: "2", label: "We'll be in touch", desc: "Our team reviews and contacts you within 24 hours" },
            { icon: "file-text" as const, step: "3", label: "Receive your quote", desc: "We send a detailed quote for your approval" },
            { icon: "check-circle" as const, step: "4", label: "Work begins", desc: "Once approved, we schedule your project" },
          ].map((item) => (
            <View key={item.step} style={styles.stepRow}>
              <View style={[styles.stepNum, { backgroundColor: C.tint }]}>
                <Text style={styles.stepNumText}>{item.step}</Text>
              </View>
              <View style={styles.stepInfo}>
                <Text style={[styles.stepLabel, { color: C.text }]}>{item.label}</Text>
                <Text style={[styles.stepDesc, { color: C.textSecondary }]}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 6,
  },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular" },
  scroll: { padding: 16, gap: 14 },
  heroBanner: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
  },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  heroTitle: { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center" },
  heroSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  actionsSection: { gap: 10 },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: { flex: 1, gap: 3 },
  actionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  actionDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  infoSection: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 14,
  },
  infoTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  stepNumText: { color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold" },
  stepInfo: { flex: 1, gap: 2 },
  stepLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  stepDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
});
