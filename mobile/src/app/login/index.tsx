import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { z } from "zod";
import { s } from "./styles";
import Input from "@/src/components/input";
import Unimed from "@/src/assets/unimed.svg";
import { loginRequest } from "@/src/api/api";
import { saveToken } from "@/src/storage/AsyncStorage";

const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" })
    .refine((val) => /@gmail\.com$/i.test(val), {
      message: "O email deve ser um Gmail (ex: usuario@gmail.com)",
    }),
  password: z.string().min(8, { message: "Senha deve ter no mínimo 8 caracteres" })
    .refine((v) => /[A-Z]/.test(v), { message: "Deve conter ao menos uma letra maiúscula" })
    .refine((v) => /[a-z]/.test(v), { message: "Deve conter ao menos uma letra minúscula" })
    .refine((v) => /\d/.test(v),    { message: "Deve conter ao menos um número" })
    .refine((v) => /[!@#$%^&*(),.?\":{}|<>]/.test(v), { message: "Deve conter ao menos um caractere especial" }),
});

function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    const parsed = loginSchema.safeParse({
      email: email.trim(),
      password,
    });

    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message || "Dados inválidos";
      Alert.alert("Erro no login", first);
      return;
    }

    try {
      setLoading(true);
      const res = await loginRequest({ email: email.trim(), password });

      if (res) {
        await saveToken(res)
        navigation.navigate("AskAI" as never);
      } else {
        Alert.alert("Erro", "Credenciais inválidas ou resposta inesperada.");
      }
    } catch (e: any) {
      const apiData = e?.response?.data;
      const msg = apiData?.message || apiData?.error || e?.message || "Falha no login";
      Alert.alert("Erro no login", msg);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={[s.screen, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#00995D" />
        <Text style={{ marginTop: 8, color: "#333" }}>Entrando...</Text>
      </View>
    );
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
          <TouchableOpacity style={s.button} onPress={onSubmit} disabled={loading}>
            <Text style={s.textButton}>LOGIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default LoginScreen;
