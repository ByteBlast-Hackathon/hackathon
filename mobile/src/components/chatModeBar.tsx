import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Bot, FileUp, CalendarClock } from "lucide-react-native";
import { colors } from "@/src/styles/styles";

export type ChatMode = "ai" | "exam" | "booking";

type Props = {
  value: ChatMode;                    // modo ativo
  onChange: (mode: ChatMode) => void; // navegação
};

export default function ChatModeBar({ value, onChange }: Props) {
  return (
    <View style={st.container}>
      <Item active={value === "ai"} onPress={() => onChange("ai")}>
        <Bot size={22} color={value === "ai" ? colors.primary[500] : "#FFF"} />
      </Item>

      <Item active={value === "exam"} onPress={() => onChange("exam")}>
        <FileUp size={22} color={value === "exam" ? colors.primary[500] : "#FFF"} />
      </Item>

      <Item active={value === "booking"} onPress={() => onChange("booking")}>
        <CalendarClock size={22} color={value === "booking" ? colors.primary[500] : "#FFF"} />
      </Item>
    </View>
  );
}

function Item({
  active, onPress, children,
}: { active: boolean; onPress: () => void; children: React.ReactNode }) {
  return (
    <TouchableOpacity
      style={[st.item, active && st.itemActive]}
      onPress={onPress}
      hitSlop={8}
    >
      {children}
    </TouchableOpacity>
  );
}

const st = StyleSheet.create({
  container: {
    height: 56,
    margin: 12,
    marginTop: 40,
    borderRadius: 16,
    backgroundColor: colors.primary[500],
    paddingHorizontal: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  item: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  itemActive: {
    backgroundColor: "#FFF",
  },
});
