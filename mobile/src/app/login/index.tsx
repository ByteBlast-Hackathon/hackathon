import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { z } from "zod";
import { s } from "./styles";
import Input from "@/src/components/input";
import Unimed from "@/src/assets/unimed.svg";

// ⬇️ Schema Zod (mesmas regras do Register para email e password)
const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" })
    .refine((val) => /@gmail\.com$/i.test(val), {
      message: "O email deve ser um Gmail (ex: usuario@gmail.com)",
    }),
  password: z.string().min(8, { message: "Senha deve ter no mínimo 8 caracteres" })
    .refine((v) => /[A-Z]/.test(v), { message: "Deve conter ao menos uma letra maiúscula" })
    .refine((v) => /[a-z]/.test(v), { message: "Deve conter ao menos uma letra minúscula" })
    .refine((v) => /\d/.test(v),    { message: "Deve conter ao menos um número" })
    .refine((v) => /[!@#$%^&*(),.?":{}|<>]/.test(v), { message: "Deve conter ao menos um caractere especial" }),
});

function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function onSubmit() {
    const parsed = loginSchema.safeParse({
      email: email.trim(),
      password,
    });

    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message || "Dados inválidos";
      Alert.alert("Erro no login", first);
      return;
    }

    // sucesso (mock)
    Alert.alert("Tudo certo!", "Login validado com sucesso (mock).");
    // navegação ou chamada de API aqui
    // navigation.navigate("Home" as never);
  }

  return (
    <View style={s.screen}>
      <View>
        <Unimed width={350} height={150} />
      </View>

      <View style={s.container}>
        <Text style={s.title}>Login</Text>

        <View style={s.form}>
          <Text style={s.label}>Email:</Text>
          <Input
            placeholder="Insira seu email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            style={s.input}
          />

          <Text style={s.label}>Senha:</Text>
          <Input
            placeholder="Insira sua senha"
            value={password}
            onChangeText={setPassword}
            passwordToggle
            secureTextEntry
            style={s.input}
          />
        </View>

        <View style={s.viewDescription}>
          <Text style={s.description}>Não possui uma conta ?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register" as never)}>
            <Text style={s.link}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>

        <View style={s.containerButton}>
          <TouchableOpacity style={s.button} onPress={onSubmit}>
            <Text style={s.textButton}>LOGIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default LoginScreen;
