import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, TextInputProps, ViewStyle } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

type Props = TextInputProps & {
  /** Mostrar ícone para alternar visibilidade quando for campo de senha */
  passwordToggle?: boolean;
  /** Estilo opcional só para o contêiner externo (wrapper) */
  containerStyle?: ViewStyle;
};

export default function Input(props: Props) {
  const { passwordToggle, style, containerStyle, secureTextEntry, ...rest } = props;

  // estado interno controla a visibilidade quando passwordToggle=true
  const [secure, setSecure] = useState<boolean>(!!secureTextEntry);

  const isPassword = !!passwordToggle;

  return (
    <View style={[styles.wrapper, style as ViewStyle, containerStyle]}>
      <TextInput
        {...rest}
        style={styles.input}
        secureTextEntry={isPassword ? secure : secureTextEntry}
      />
      {isPassword && (
        <TouchableOpacity style={styles.iconBtn} onPress={() => setSecure(s => !s)} hitSlop={8}>
          {secure ? <EyeOff size={20} color="#666" /> : <Eye size={20} color="#666" />}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "80%",
    height: 40,
    backgroundColor: "#FFF",
    borderRadius: 20,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: "100%",
  },
  iconBtn: {
    paddingLeft: 8,
  },
});
