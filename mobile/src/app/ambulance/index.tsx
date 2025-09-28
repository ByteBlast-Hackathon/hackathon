import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View, FlatList } from "react-native";
import TopBar from "@/src/components/TopBar";
import { colors, fonts } from "@/src/styles/styles";
import UnimedLogo from "@/src/assets/unimedIcon.svg";

type Ambulance = {
  id: string;
  name: string;
  status: "disponível" | "aceita" | "a caminho" | "chegou";
  // coordenadas “falsas” em porcentagem do container (0–100)
  x: number;
  y: number;
  etaMin: number;      // estimativa inicial
};

const USER_POS = { x: 68, y: 62 }; // posição “fake” do usuário no mapa

function distance(a: {x:number;y:number}, b: {x:number;y:number}) {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.sqrt(dx*dx + dy*dy);
}

export default function AmbulanceDemo() {
  const [ambulances, setAmbulances] = useState<Ambulance[]>([
    { id:"AMB-21", name:"Unimed 21", status:"disponível", x:18, y:22, etaMin:12 },
    { id:"AMB-07", name:"Unimed 07", status:"disponível", x:42, y:35, etaMin:9  },
    { id:"AMB-33", name:"Unimed 33", status:"disponível", x:80, y:15, etaMin:16 },
    { id:"AMB-12", name:"Unimed 12", status:"disponível", x:12, y:78, etaMin:14 },
  ]);

  const [assignedId, setAssignedId] = useState<string | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nearest = useMemo(() => {
    const sorted = [...ambulances].sort((a,b) =>
      distance({x:a.x,y:a.y}, USER_POS) - distance({x:b.x,y:b.y}, USER_POS)
    );
    return sorted[0];
  }, [ambulances]);

  function startSimulation(targetId: string) {
    setAmbulances(prev => prev.map(a => a.id === targetId
      ? { ...a, status: "aceita" }
      : a
    ));
    setAssignedId(targetId);

    // timeline simples: a cada 1s diminuí ETA e “move” no mapa
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
       setAmbulances(prev => prev.map(a => {
        if (a.id !== targetId) return a;
        // aproxima da posição do usuário
        const nx = a.x + (USER_POS.x - a.x) * 0.18; // easing
        const ny = a.y + (USER_POS.y - a.y) * 0.18;
        const nextEta = Math.max(0, a.etaMin - 1);
        let nextStatus: Ambulance["status"] = a.status;

        if (a.status === "aceita") nextStatus = "a caminho";
        if (nextEta <= 0 || distance({x:nx,y:ny}, USER_POS) < 2) {
          nextStatus = "chegou";
        }

        return { ...a, x: nx, y: ny, etaMin: nextEta, status: nextStatus };
      }));
    }, 1000);
  }

  useEffect(() => {
    // para o timer quando “chegou”
    if (!assignedId) return;
    const assigned = ambulances.find(a => a.id === assignedId);
    if (assigned?.status === "chegou") {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      Alert.alert("Ambulância chegou", `A ${assigned.name} chegou ao seu local.`);
    }
  }, [ambulances, assignedId]);

  useEffect(() => () => {
    if (tickRef.current) clearInterval(tickRef.current);
  }, []);

  const selected = assignedId
    ? ambulances.find(a => a.id === assignedId) || nearest
    : nearest;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <TopBar
        Logo={UnimedLogo}
        onPressLogo={() => {}}
        onPressSOS={() => Alert.alert("S.O.S", "Chamado de emergência acionado!")}
      />

      {/* “Mapa” mockado */}
      <View style={st.map}>
        {/* grid */}
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={`h${i}`} style={[st.gridLine, { top: `${(i+1)*10}%` }]} />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={`v${i}`} style={[st.gridLineVert, { left: `${(i+1)*10}%` }]} />
        ))}

        {/* usuário */}
        <View style={[st.userPin, { left: `${USER_POS.x}%`, top: `${USER_POS.y}%` }]}>
          <View style={st.userDot} />
        </View>
        <Text style={[st.pinLabel, { left: `${USER_POS.x}%`, top: `${USER_POS.y-5}%` }]}>Você</Text>

        {/* ambulâncias */}
        {ambulances.map(a => (
          <View key={a.id}>
            <View
              style={[
                st.ambPin,
                { left: `${a.x}%`, top: `${a.y}%` },
                a.id === selected?.id && st.ambPinActive,
              ]}
            />
            <Text
              style={[
                st.pinLabel,
                { left: `${a.x}%`, top: `${a.y - 6}%` },
                a.id === selected?.id && { color: colors.primary[500], fontFamily: fonts.family.bold }
              ]}
            >
              {a.name}
            </Text>
          </View>
        ))}
      </View>

      {/* resumo/ação */}
      <View style={st.infoCard}>
        <Text style={st.title}>Ambulância mais próxima</Text>
        <Text style={st.rowText}>
          <Text style={st.bold}>{selected.name}</Text> — {selected.status.toUpperCase()}
        </Text>
        <Text style={st.rowText}>
          ETA: <Text style={st.bold}>{Math.max(0, selected.etaMin)} min</Text>
        </Text>

        {assignedId ? (
          <View style={st.progressWrap}>
            <View style={[st.progressBar, { width: `${Math.min(100, (1 - selected.etaMin / (selected.etaMin + 5 || 1)) * 100)}%` }]} />
          </View>
        ) : null}

        <TouchableOpacity
          style={[st.cta, assignedId && { opacity: 0.6 }]}
          disabled={!!assignedId}
          onPress={() => startSimulation(selected.id)}
        >
          <Text style={st.ctaText}>{assignedId ? "Chamado em andamento..." : "Chamar ambulância"}</Text>
        </TouchableOpacity>
      </View>

      {/* lista de outras ambulâncias */}
      <FlatList
        data={[...ambulances].sort((a,b) =>
          distance({x:a.x,y:a.y}, USER_POS) - distance({x:b.x,y:b.y}, USER_POS)
        )}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        ListHeaderComponent={<Text style={[st.title, { marginBottom: 8 }]}>Unidades por proximidade</Text>}
        renderItem={({ item }) => {
          const kmFake = (distance({x:item.x,y:item.y}, USER_POS) / 10).toFixed(1);
          return (
            <View style={st.card}>
              <View style={{ flex: 1 }}>
                <Text style={st.cardTitle}>{item.name}</Text>
                <Text style={st.cardLine}>Status: {item.status}</Text>
                <Text style={st.cardLine}>Dist.: {kmFake} km • ETA: {Math.max(0, item.etaMin)} min</Text>
              </View>
              <TouchableOpacity
                style={st.cardBtn}
                disabled={!!assignedId}
                onPress={() => startSimulation(item.id)}
              >
                <Text style={st.cardBtnTxt}>{assignedId ? "Em curso" : "Solicitar"}</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}

const st = StyleSheet.create({
  map: {
    height: 220,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    backgroundColor: "#F3F5F4",
    overflow: "hidden",
  },
  gridLine: {
    position: "absolute",
    left: 0, right: 0, height: 1,
    backgroundColor: "#E6ECE9",
  },
  gridLineVert: {
    position: "absolute",
    top: 0, bottom: 0, width: 1,
    backgroundColor: "#E6ECE9",
  },
  userPin: {
    position: "absolute",
    width: 18, height: 18, borderRadius: 9,
    marginLeft: -9, marginTop: -9,
    backgroundColor: "#DDF4E9",
    borderWidth: 2, borderColor: colors.primary[500],
    alignItems: "center", justifyContent: "center",
  },
  userDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary[500],
  },
  ambPin: {
    position: "absolute",
    width: 14, height: 14, borderRadius: 7,
    marginLeft: -7, marginTop: -7,
    backgroundColor: "#FF795A",
    borderWidth: 1, borderColor: "#E45739",
  },
  ambPinActive: {
    backgroundColor: "#FFD7CF",
    borderColor: "#FF795A",
    transform: [{ scale: 1.25 }],
  },
  pinLabel: {
    position: "absolute",
    fontSize: 10,
    color: "#444",
    transform: [{ translateX: -8 }],
  },
  infoCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#EEF1EF",
  },
  title: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.lg,
    color: colors.neutral[900],
    marginBottom: 8,
  },
  rowText: {
    fontFamily: fonts.family.regular,
    fontSize: fonts.size.md,
    color: colors.neutral[900],
    marginBottom: 2,
  },
  bold: { fontFamily: fonts.family.bold },
  cta: {
    marginTop: 12,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary[500],
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: "#FFF", fontFamily: fonts.family.bold },
  progressWrap: {
    height: 8, backgroundColor: "#EEF2F1", borderRadius: 6, overflow: "hidden",
    marginTop: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.primary[500],
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#EEF1EF",
    marginBottom: 10,
  },
  cardTitle: {
    fontFamily: fonts.family.medium,
    color: colors.neutral[900],
    marginBottom: 2,
  },
  cardLine: { color: "#4A4A4A", fontSize: 12 },
  cardBtn: {
    paddingHorizontal: 12, height: 36,
    borderRadius: 10, backgroundColor: colors.primary[500],
    alignItems: "center", justifyContent: "center",
  },
  cardBtnTxt: { color: "#FFF", fontFamily: fonts.family.bold, fontSize: 12 },
});
