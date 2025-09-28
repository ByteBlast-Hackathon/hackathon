import React from "react";
import { View, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { Bot, FileUp, CalendarClock, User } from "lucide-react-native";
import { colors } from "@/src/styles/styles";

export type BottomKey = "ai" | "exam" | "booking" | "user";

type Props = { value: BottomKey; onChange: (k: BottomKey) => void; style?: ViewStyle; };

export default function Menu({ value, onChange, style }: Props) {
  return (
    <View style={[st.wrapper, style]}>
      <View style={st.container}>
        <Item active={value === "ai"} onPress={() => onChange("ai")}>
          <Bot size={24} color={value === "ai" ? colors.primary[500] : "#FFFFFF"} />
        </Item>
        <Item active={value === "exam"} onPress={() => onChange("exam")}>
          <FileUp size={24} color={value === "exam" ? colors.primary[500] : "#FFFFFF"} />
        </Item>
        <Item active={value === "booking"} onPress={() => onChange("booking")}>
          <CalendarClock size={24} color={value === "booking" ? colors.primary[500] : "#FFFFFF"} />
        </Item>
        <Item active={value === "user"} onPress={() => onChange("user")}>
          <User size={24} color={value === "user" ? colors.primary[500] : "#FFFFFF"} />
        </Item>
      </View>
    </View>
  );
}

function Item({ active, onPress, children }: { active: boolean; onPress: () => void; children: React.ReactNode }) {
  return (
    <TouchableOpacity style={[st.item, active && st.activeItem]} onPress={onPress} hitSlop={8}>
      {children}
    </TouchableOpacity>
  );
}

const st = StyleSheet.create({
  wrapper: { paddingHorizontal: 16, paddingBottom: 16 },
  container: {
    backgroundColor: colors.primary[500], height: 64, borderRadius: 24,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  item: { width: 48, height: 48, justifyContent: "center", alignItems: "center", borderRadius: 14 },
  activeItem: { backgroundColor: "#FFFFFF" },
});
