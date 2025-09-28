import { View, Text, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { z } from "zod";
import { s } from "./styles";
import Input from "@/src/components/input";
import Unimed from "@/src/assets/unimed.svg";

const onlyDigits = (v: string) => v.replace(/\D/g, "");
const formatCPF = (v: string) => {
  const d = onlyDigits(v).slice(0, 11);
  const p1 = d.slice(0, 3), p2 = d.slice(3, 6), p3 = d.slice(6, 9), p4 = d.slice(9, 11);
  if (d.length <= 3) return p1;
  if (d.length <= 6) return `${p1}.${p2}`;
  if (d.length <= 9) return `${p1}.${p2}.${p3}`;
  return `${p1}.${p2}.${p3}-${p4}`;
};
const formatPhone = (v: string) => {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
};
const toYYYYMMDD = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formSchema = z.object({
  name: z.string().min(10, { message: "Nome deve ter no minimo 10 caracteres" }),
  email: z.string().email({ message: "Email invalido" })
    .refine((val) => /@gmail\.com$/i.test(val), { message: "O email deve ser um Gmail (ex: usuario@gmail.com)" }),
  cpf: z.string().refine((val) => /^\d{11}$/.test(val), { message: "CPF inválido. Deve conter 11 dígitos." }),
  birthDate: z.string().refine((val) => {
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return false;
    const t = new Date();
    let age = t.getFullYear() - d.getFullYear();
    const m = t.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < d.getDate())) age--;
    return age >= 18;
  }, { message: "Você deve ter pelo menos 18 anos" }),
  phone: z.string().refine((val) => /^\d{10,11}$/.test(val), {
    message: "Número de celular inválido (incluir DDD, 10 ou 11 dígitos)",
  }),
  password: z.string().min(8, { message: "Senha deve ter no minimo 8 caracteres" })
    .refine((v) => /[A-Z]/.test(v), { message: "Deve conter ao menos uma letra maiúscula" })
    .refine((v) => /[a-z]/.test(v), { message: "Deve conter ao menos uma letra minúscula" })
    .refine((v) => /\d/.test(v), { message: "Deve conter ao menos um número" })
    .refine((v) => /[!@#$%^&*(),.?\":{}|<>]/.test(v), { message: "Deve conter ao menos um caractere especial" }),
  confirmPassword: z.string().min(1, { message: "Confirme sua senha" }),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "As senhas não conferem", path: ["confirmPassword"] });
  }
});

export default function RegisterScreen() {
  const navigation = useNavigation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");

  const [birth, setBirth] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirm] = useState("");

  const openPicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: birth ?? new Date(2000, 0, 1),
        mode: "date",
        is24Hour: true,
        onChange: (_, date) => {
          if (date) setBirth(date);
        },
        maximumDate: new Date(),
      });
    } else {
      setShowPicker(true);
    }
  };

  const onSubmit = () => {
    const data = {
      name: name.trim(),
      email: email.trim(),
      cpf: onlyDigits(cpf),
      birthDate: birth ? toYYYYMMDD(birth) : "",
      phone: onlyDigits(phone),
      password,
      confirmPassword,
    };
    const parsed = formSchema.safeParse(data);
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message || "Dados inválidos";
      Alert.alert("Erro no cadastro", first);
      return;
    }
    Alert.alert("Tudo certo!", "Cadastro validado com sucesso (mock).");
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ alignItems: "center", paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={{ marginTop: 100, marginBottom: 12 }}>
          <Unimed width={320} height={120} />
        </View>

        <View style={s.container}>
          <Text style={s.title}>Cadastro</Text>

          <View style={s.form}>
            <Text style={s.label}>Nome completo:</Text>
            <Input
              placeholder="Ex: Maria Silva Santos"
              value={name}
              onChangeText={setName}
              style={s.input}
            />

            <Text style={s.label}>Email:</Text>
            <Input
              placeholder="usuario@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              style={s.input}
            />

            <Text style={s.label}>CPF:</Text>
            <Input
              placeholder="000.000.000-00"
              keyboardType="number-pad"
              value={cpf}
              onChangeText={(v) => setCpf(formatCPF(v))}
              style={s.input}
            />

            <Text style={s.label}>Data de nascimento:</Text>
            <TouchableOpacity onPress={openPicker} activeOpacity={0.7} style={s.input}>
              <Text style={{ lineHeight: 40, color: birth ? "#000" : "#888" }}>
                {birth ? toYYYYMMDD(birth) : "Selecionar data"}
              </Text>
            </TouchableOpacity>

            {Platform.OS === "ios" && showPicker && (
              <DateTimePicker
                value={birth ?? new Date(2000, 0, 1)}
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                onChange={(_, date) => {
                  if (date) setBirth(date);
                }}
                style={{ alignSelf: "stretch" }}
              />
            )}

            <Text style={s.label}>Celular (com DDD):</Text>
            <Input
              placeholder="(11) 9 9999-9999"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(v) => setPhone(formatPhone(v))}
              style={s.input}
            />

            <Text style={s.label}>Senha:</Text>
            <Input
              placeholder="Crie sua senha"
              value={password}
              onChangeText={setPassword}
              passwordToggle
              secureTextEntry
              style={s.input}
            />

            <Text style={s.label}>Confirmação de senha:</Text>
            <Input
              placeholder="Repita sua senha"
              value={confirmPassword}
              onChangeText={setConfirm}
              passwordToggle
              secureTextEntry
              style={s.input}
            />
          </View>

          <View style={s.viewDescription}>
            <Text style={s.description}>Já possui uma conta ?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login" as never)}>
              <Text style={s.link}>Login</Text>
            </TouchableOpacity>
          </View>

          <View style={s.containerButton}>
            <TouchableOpacity style={s.button} onPress={onSubmit}>
              <Text style={s.textButton}>CADASTRAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
