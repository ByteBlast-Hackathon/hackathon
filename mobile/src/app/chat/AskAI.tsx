// src/app/chat/AskAI.tsx
import React, { useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, FlatList } from "react-native";
import { s } from "./styles";
import type { Msg } from "./types";
import { aiChat } from "@/src/api/api";
import Menu from "@/src/components/menu";
import ChatModeBar from "../../components/chatModeBar";

export default function AskAI({ navigation }: any) {
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: "m0", from: "ai", text: "👋 Oi! Sou a UnIA. Me pergunte qualquer coisa sobre seu plano, exames e consultas." },
  ]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const idRef = useRef(1);

  async function send() {
    const content = text.trim();
    if (!content) return;
    setText("");

    const userMsg: Msg = { id: `u${idRef.current++}`, from: "user", text: content };
    setMsgs((prev) => [userMsg, ...prev]);

    try {
      setLoading(true);
      const data = await aiChat(content); // espera { reply: string }
      const aiMsg: Msg = { id: `a${idRef.current++}`, from: "ai", text: data?.reply ?? "Ok, anotado." };
      setMsgs((prev) => [aiMsg, ...prev]);
    } catch {
      setMsgs((prev) => [
        { id: `e${idRef.current++}`, from: "ai", text: "⚠️ Não consegui responder agora. Tente novamente." },
        ...prev,
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1 }}>
        <ChatModeBar
            value="ai"
            onChange={(mode) => {
                if (mode === "ai") return;
                if (mode === "exam") navigation.navigate("VerifyExam");
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
              <Text style={s.bubbleTitle}>{item.from === "user" ? "Você" : "UnIA"}</Text>
              <Text style={s.bubbleText}>{item.text}</Text>
            </View>
          </View>
        )}
      />

      <View style={s.bar}>
        <View style={s.row}>
          <TextInput
            style={s.input}
            placeholder="Escreva sua mensagem..."
            value={text}
            onChangeText={setText}
            multiline
          />
          <TouchableOpacity style={s.sendBtn} onPress={send} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={s.sendTxt}>Enviar</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <Menu page="chat" isSelected icon="bot" onPress={(t) => navigation.navigate(t === "chat" ? "Chat" : "User")} />
    </View>
  );
}