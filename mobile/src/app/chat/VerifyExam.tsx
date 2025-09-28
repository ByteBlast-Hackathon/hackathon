import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { s } from "./styles";
import type { Msg } from "./types";
import { verifyExam } from "@/src/api/api";
import Menu from "@/src/components/menu";
import ChatModeBar from "../../components/chatModeBar";

export default function VerifyExam({ navigation }: any) {
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: "m0", from: "ai", text: "Envie o pedido de exame (PDF ou imagem) que eu verifico a autorização, ok?" },
  ]);
  const [file, setFile] = useState<{ uri: string; name?: string; type?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const idRef = useRef(1);

  async function pick() {
    const res = await DocumentPicker.getDocumentAsync({
      multiple: false,
      type: ["application/pdf", "image/*"],
      copyToCacheDirectory: true,
    });
    if (!res.canceled && res.assets?.[0]) {
      const f = res.assets[0];
      setFile({ uri: f.uri, name: f.name, type: f.mimeType || "application/pdf" });
    }
  }

  async function send() {
    if (!file) return;
    const userMsg: Msg = { id: `u${idRef.current++}`, from: "user", text: `📎 ${file.name || "arquivo"}` };
    setMsgs((p) => [userMsg, ...p]);

    try {
      setLoading(true);
      const data = await verifyExam(file); // espera {status: "autorizado" | "auditoria"}
      console.log("data: ")
      const status = (data?.status || "").toString().toLowerCase();
      const reply =
        status.includes("autoriz") ?
        "✅ Análise concluída: seu exame foi AUTORIZADO." :
        "🕒 Recebido. Seu exame foi encaminhado para AUDITORIA.";
      setMsgs((p) => [{ id: `a${idRef.current++}`, from: "ai", text: reply }, ...p]);
    } catch {
      setMsgs((p) => [{ id: `e${idRef.current++}`, from: "ai", text: "Falha no envio. Tente novamente." }, ...p]);
    } finally {
      setLoading(false);
      setFile(null);
    }
  }

  return (
    <View style={{ flex: 1 }}>
        <ChatModeBar
            value="exam"
            onChange={(mode) => {
                if (mode === "ai") navigation.navigate("AskAI");
                if (mode === "exam") return;
                if (mode === "booking") navigation.navigate("BookAppointment");
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
              <Text style={s.bubbleTitle}>{item.from === "user" ? "Você" : "UnIA Exams"}</Text>
              <Text style={s.bubbleText}>{item.text}</Text>
            </View>
          </View>
        )}
      />

      <View style={s.bar}>
        <View style={s.row}>
          <TouchableOpacity style={s.attachBtn} onPress={pick}>
            <Text style={s.attachTxt}>{file ? "Trocar arquivo" : "Selecionar arquivo"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.sendBtn} onPress={send} disabled={!file || loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={s.sendTxt}>Enviar</Text>}
          </TouchableOpacity>
        </View>
        {file && <Text style={{ marginTop: 6 }} numberOfLines={1}>📎 {file.name}</Text>}
      </View>

      <Menu page="chat" isSelected icon="bot" onPress={(t) => navigation.navigate(t === "chat" ? "Chat" : "User")} />
    </View>
  );
}
