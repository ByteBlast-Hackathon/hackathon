import React from "react";
import { View, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { Bot, User } from "lucide-react-native";
import { colors } from "@/src/styles/styles";

type Page = "chat" | "user";

type Props = {
  /** Página atual (controla qual item fica selecionado) */
  page: Page;
  /** Navegar ao tocar em um item */
  onPress: (target: Page) => void;
  /** Estilo externo opcional */
  style?: ViewStyle;

  /** Mantido só pra compatibilidade com o que você pediu; é opcional */
  icon?: "bot" | "user";
  isSelected?: boolean;
};

export default function Menu({ page, onPress, style }: Props) {
  const isChat = page === "chat";
  const isUser = page === "user";

  return (
    <View style={[styles.wrapper, style]}>
      <View style={styles.container}>
        {/* Chat / IA */}
        <TouchableOpacity
          style={isChat ? styles.activeItem : styles.item}
          onPress={() => onPress("chat")}
          hitSlop={8}
        >
          <Bot size={24} color={isChat ? colors.primary[500] : "#FFFFFF"} />
        </TouchableOpacity>

        {/* Perfil */}
        <TouchableOpacity
          style={isUser ? styles.activeItem : styles.item}
          onPress={() => onPress("user")}
          hitSlop={8}
        >
          <User size={24} color={isUser ? colors.primary[500] : "#FFFFFF"} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: 16, paddingBottom: 16 },
  container: {
    backgroundColor: colors.primary[500],
    height: 64,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  item: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  activeItem: {
    width: 48,
    height: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
});