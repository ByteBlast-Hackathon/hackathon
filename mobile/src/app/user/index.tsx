import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView, RefreshControl, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenScaffold from "@/src/components/screenScaffold";
import UnimedLogo from "@/src/assets/unimedIcon.svg";
import { getProfile, UserProfile } from "@/src/api/api";
import { s } from "./styles";
import { colors } from "@/src/styles/styles";
import { clearToken, getToken } from "@/src/storage/AsyncStorage";

const maskEmail = (email?: string) => {
  if (!email) return "-";
  const [user, domain] = email.split("@");
  if (!domain) return email;
  const shown = user.slice(0, 2);
  return `${shown}${"•".repeat(Math.max(1, user.length - 2))}@${domain}`;
};

const maskCPF = (cpf?: string) => {
  if (!cpf) return "-";
  // aceita com ou sem pontuação
  const d = cpf.replace(/\D/g, "").padStart(11, "0").slice(-11);
  // 000.***.***-00
  return `${d.slice(0,3)}.${"•".repeat(3)}.${"•".repeat(3)}-${d.slice(9)}`;
};

const maskPhone = (phone?: string) => {
  if (!phone) return "-";
  const d = phone.replace(/\D/g, "");
  // (11) 9****-**99
  if (d.length >= 10) {
    const ddd = d.slice(0,2);
    const rest = d.slice(2);
    const tail = rest.slice(-2);
    return `(${ddd}) ${rest[0] ?? ""}${"•".repeat(Math.max(0, rest.length-3))}-${"•".repeat(Math.max(0, Math.min(2, rest.length-1)))}${tail}`;
  }
  return `(**) ${"•".repeat(4)}-**${d.slice(-2)}`;
};

export default function UserScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      setError(null);
      const data = await getProfile();
      setProfile(data);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Falha ao carregar perfil";
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const handleLogout = async () => {
    await clearToken();
    
    navigation.navigate("Login" as never);
  }

  useEffect(() => { load(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const fmtDate = (iso?: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? iso : d.toLocaleDateString("pt-BR");
  };

  return (
    <ScreenScaffold
      logo={UnimedLogo}
      onPressLogo={() => navigation.navigate("User" as never)}
      onPressSOS={() => navigation.navigate("SOS" as never)}
      tab="user"
      onChangeTab={(k) => {
        if (k === "ai") navigation.navigate("AskAI" as never);
        if (k === "exam") navigation.navigate("VerifyExam" as never);
        if (k === "booking") navigation.navigate("BookAppointment" as never);
        if (k === "user") navigation.navigate("User" as never);
      }}
    >
      {loading ? (
        <View style={s.screenLoading}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={s.container}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Text style={s.title}>Dados cadastrais</Text>

          {error ? (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : profile ? (
            <View style={s.card}>
              <Row label="Nome"        value={profile.name} />
              <Row label="Email"       value={maskEmail(profile.email)} />
              <Row label="CPF"         value={maskCPF(profile.cpf)} />
              <Row label="Celular"     value={maskPhone(profile.phone)} />
              <Row label="Nascimento"  value={fmtDate(profile.birthDate)} />
              <Row label="Status"      value={profile.isActive ? "Ativo" : "Inativo"} />
              <Row label="Criado em"   value={fmtDate(profile.createdAt)} />
              <Row label="Atualizado"  value={fmtDate(profile.updatedAt)} />
            </View>
          ) : null}
          <TouchableOpacity style={s.button} onPress={() => handleLogout()}>
            <Text style={s.textButton}>
              SAIR
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </ScreenScaffold>
  );
}

function Row({ label, value }: { label: string; value?: string | number | boolean }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}:</Text>
      <Text style={s.rowValue}>{String(value ?? "-")}</Text>
    </View>
  );
}