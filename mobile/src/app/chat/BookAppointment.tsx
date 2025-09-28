// src/app/chat/BookAppointment.tsx
import React, { useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, FlatList, Alert } from "react-native";
import { s } from "./styles";
import type { Msg } from "./types";
import { completeBooking, BookingPayload } from "@/src/api/api";
import Menu from "@/src/components/menu";
import ChatModeBar from "../../components/chatModeBar";

const steps = [
  { key: "name", prompt: "Informe seu nome completo:" },
  { key: "birthDate", prompt: "Data de nascimento (YYYY-MM-DD):" },
  { key: "specialty", prompt: "Especialidade desejada (ex: cardiology):" },
  { key: "reason", prompt: "Qual o motivo da consulta?" },
  { key: "preferredDate", prompt: "Data preferida (YYYY-MM-DD):" },
  { key: "preferredTime", prompt: "Horário preferido (HH:mm):" },
  { key: "city", prompt: "Cidade para o atendimento:" },
] as const;

export default function BookAppointment({ navigation }: any) {
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: "m1", from: "ai", text: steps[0].prompt },
    { id: "m0", from: "ai", text: "Vamos agendar sua consulta. Vou perguntar rapidinho alguns dados." },
  ]);
  const [form, setForm] = useState<BookingPayload>({
    name: "", birthDate: "", specialty: "", reason: "", preferredDate: "", preferredTime: "", city: "",
  });
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const idRef = useRef(2);

  function setField(k: keyof BookingPayload, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function next() {
    const val = answer.trim();
    if (!val) return;
    const key = steps[idx].key as keyof BookingPayload;

    // eco do usuário
    setMsgs((p) => [{ id: `u${idRef.current++}`, from: "user", text: val }, ...p]);
    setField(key, val);
    setAnswer("");

    if (idx < steps.length - 1) {
      const nxt = idx + 1;
      setIdx(nxt);
      setMsgs((p) => [{ id: `a${idRef.current++}`, from: "ai", text: steps[nxt].prompt }, ...p]);
      return;
    }

    // fim: enviar
    try {
      setLoading(true);
      await completeBooking(form);
      setMsgs((p) => [
        { id: `a${idRef.current++}`, from: "ai", text: "✅ Agendamento completo executado com sucesso." },
        ...p,
      ]);
      Alert.alert("Tudo certo!", "Seu pedido de agendamento foi enviado.");
    } catch {
      setMsgs((p) => [{ id: `e${idRef.current++}`, from: "ai", text: "Falha ao agendar. Tente novamente." }, ...p]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1 }}>
        <ChatModeBar
            value="booking"
            onChange={(mode) => {
                if (mode === "ai") navigation.navigate("AskAI");
                if (mode === "exam") navigation.navigate("VerifyExam");
                if (mode === "booking") return;
            }}
        />
      <FlatList
        inverted
        data={msgs}
        keyExtractor={(m) => m.id}
        contentContainerStyle={s.list}
        renderItem={({ item }) => (
          <View style={[s.bubbleRow, { justifyContent: item.from === "user" ? "flex-end" : "flex-start" }]}>
            <View style={item.from === "user" ? s.bubbleUser : s.bubbleAI}>
              <Text style={s.bubbleTitle}>{item.from === "user" ? "Você" : "UnIA Agend."}</Text>
              <Text style={s.bubbleText}>{item.text}</Text>
            </View>
          </View>
        )}
      />

      <View style={s.bar}>
        <View style={s.row}>
          <TextInput
            style={s.input}
            placeholder="Digite sua resposta..."
            value={answer}
            onChangeText={setAnswer}
            editable={!loading}
          />
          <TouchableOpacity style={s.sendBtn} onPress={next} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={s.sendTxt}>Enviar</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <Menu page="chat" isSelected icon="bot" onPress={(t) => navigation.navigate(t === "chat" ? "Chat" : "User")} />
    </View>
  );
}
