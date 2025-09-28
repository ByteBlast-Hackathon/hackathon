import React from "react";
import { View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Menu from "@/src/components/menu";

export default function UserScreen() {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, justifyContent: "space-between" }}>
      {/* conteúdo do perfil aqui */}
      <View style={{ padding: 16 }}>
        <Text>Dados cadastrais</Text>
      </View>

      <Menu
        page="user"
        isSelected
        icon="user"
        onPress={(target) =>
          navigation.navigate((target === "chat" ? "Chat" : "User") as never)
        }
      />
    </View>
  );
}
