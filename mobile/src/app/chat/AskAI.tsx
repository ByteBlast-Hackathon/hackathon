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
    { id: "m0", from: "ai", text: "👋 Oi! Sou a UnIA. Me pergunte qualquer coisa sobre seu plano, e dúvidas frequentes." },
  ]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggested, setSuggested] = useState<string[]>([]);
  const idRef = useRef(1);

  // fluxo unificado para perguntar (usado pelo input e pelos chips)
  async function ask(content: string) {
    const question = content.trim();
    if (!question) return;

    // limpa input só quando veio do campo
    if (text.trim() === question) setText("");

    const userMsg: Msg = { id: `u${idRef.current++}`, from: "user", text: question };
    setMsgs((prev) => [userMsg, ...prev]);

    try {
      setLoading(true);
      const data = await aiChat(question);
      // data esperado: { answer: string, confidence?: number, source?: string, suggestedQuestions?: string[] }
      const pieces: string[] = [];
      pieces.push(data?.answer || "Ok, anotado.");

      const aiMsg: Msg = { id: `a${idRef.current++}`, from: "ai", text: pieces.join(" ") };
      setMsgs((prev) => [aiMsg, ...prev]);

      // atualiza chips de sugestão (até 5)
      if (Array.isArray(data?.suggestedQuestions) && data.suggestedQuestions.length) {
        setSuggested(data.suggestedQuestions.slice(0, 5));
      } else {
        setSuggested([]);
      }
    } catch (e) {
      setMsgs((prev) => [
        { id: `e${idRef.current++}`, from: "ai", text: "⚠️ Não consegui responder agora. Tente novamente." },
        ...prev,
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function send() {
    const content = text.trim();
    if (!content) return;
    await ask(content);
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

      {/* Quick replies (chips) */}
      {suggested.length > 0 && (
        <View style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {suggested.map((q, i) => (
              <TouchableOpacity
                key={`${q}-${i}`}
                onPress={() => ask(q)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 16,
                  backgroundColor: "#F1F5F4",
                  borderWidth: 1,
                  borderColor: "#E3E8E6",
                }}
              >
                <Text style={{ fontSize: 13 }}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

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
