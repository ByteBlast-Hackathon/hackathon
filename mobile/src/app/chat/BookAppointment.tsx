// src/app/chat/BookAppointment.tsx
import React, { useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, FlatList, Alert } from "react-native";
import { s } from "./styles";
import type { Msg } from "./types";
import { completeBooking, BookingPayload } from "@/src/api/api";
import ScreenScaffold from "@/src/components/screenScaffold";
import UnimedLogo from "@/src/assets/unimedIcon.svg";

function formatBookingReply(data: any): string {
  if (!data) return "Não recebi dados do agendamento.";

  // Mensagem base
  const lines: string[] = [];
  if (data.message) lines.push(`✅ ${data.message}`);
  if (data.protocol) lines.push(`Protocolo: ${data.protocol}`);

  const d = data.appointmentDetails || {};
  if (d.patientName)        lines.push(`Paciente: ${d.patientName}`);
  if (d.patientBirthDate)   lines.push(`Nascimento: ${d.patientBirthDate}`);
  if (d.appointmentDate || d.appointmentTime) {
    lines.push(`Consulta: ${[d.appointmentDate, d.appointmentTime].filter(Boolean).join(" às ")}`);
  }
  if (d.doctorName)         lines.push(`Médico(a): ${d.doctorName}`);
  if (d.doctorSpecialty)    lines.push(`Especialidade: ${d.doctorSpecialty}`);
  if (d.doctorCity)         lines.push(`Cidade: ${d.doctorCity}`);
  if (d.reason)             lines.push(`Motivo: ${d.reason}`);
  if (d.status)             lines.push(`Status: ${d.status}`);

  // fallback se vier algo diferente
  if (!lines.length) {
    try { return JSON.stringify(data, null, 2); } catch { return String(data); }
  }
  return lines.join("\n");
}

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

    // ainda há perguntas → avança
    if (idx < steps.length - 1) {
      const nxt = idx + 1;
      setIdx(nxt);
      setMsgs((p) => [{ id: `a${idRef.current++}`, from: "ai", text: steps[nxt].prompt }, ...p]);
      return;
    }

    // fim: enviar para API e exibir exatamente o que ela retornar
    try {
      setLoading(true);
      const data = await completeBooking(form); // retorna { success, protocol, message, appointmentDetails: {...} }

      const replyText = formatBookingReply(data);
      setMsgs((p) => [
        { id: `a${idRef.current++}`, from: "ai", text: replyText },
        ...p,
      ]);
    } catch (e: any) {
      const apiMsg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "Falha ao agendar. Tente novamente.";
      setMsgs((p) => [{ id: `e${idRef.current++}`, from: "ai", text: apiMsg }, ...p]);
    } finally {
      setLoading(false);
    }
  }

  return (
      <ScreenScaffold
      logo={UnimedLogo}
      onPressLogo={() => navigation.navigate("User" as never)}
      onPressSOS={() => navigation.navigate("SOS" as never)}
      tab="booking"
      onChangeTab={(k) => {
        if (k === "ai") navigation.navigate("AskAI" as never);
        if (k === "exam") navigation.navigate("VerifyExam" as never);
        if (k === "booking") navigation.navigate("BookAppointment" as never);
        if (k === "user") navigation.navigate("User" as never);
      }}
    >
    <View style={{ flex: 1 }}>
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
    </View>
    </ScreenScaffold>
  );
}
