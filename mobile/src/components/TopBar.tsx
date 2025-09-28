import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Siren } from "lucide-react-native";
import { colors } from "@/src/styles/styles";

type Props = {
  onPressLogo?: () => void;
  onPressSOS: () => void;
  Logo?: React.ComponentType<{ width?: number; height?: number }>;
};

export default function TopBar({ onPressLogo, onPressSOS, Logo }: Props) {
  return (
    <SafeAreaView edges={["top"]} style={st.safe}>
      <View style={st.header}>
        <TouchableOpacity onPress={onPressLogo} disabled={!onPressLogo} hitSlop={8} style={st.logoWrap}>
          {Logo ? <Logo width={48} height={48} /> : <View style={st.logoFallback} />}
        </TouchableOpacity>

        <TouchableOpacity onPress={onPressSOS} style={st.sosBtn} hitSlop={8} accessibilityLabel="Botão de emergência S.O.S">
          <Siren size={18} color="#FFF" />
          <Text style={st.sosTxt}>S.O.S</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { backgroundColor: "#fff" },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 8 : 0,
    paddingBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoWrap: { padding: 4 },
  logoFallback: {
    width: 28, height: 28, borderRadius: 6,
    backgroundColor: colors.primary[500], opacity: 0.2,
  },
  sosBtn: {
    height: 36, borderRadius: 18, paddingHorizontal: 10,
    backgroundColor: "#FF5A2B", flexDirection: "row",
    alignItems: "center", gap: 6,
  },
  sosTxt: { color: "#FFF", fontWeight: "700", fontSize: 12 },
});
