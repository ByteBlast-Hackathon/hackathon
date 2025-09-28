// src/app/chat/styles.ts
import { StyleSheet } from "react-native";
import { colors, fonts } from "@/src/styles/styles";

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.neutral.white },
  list: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8 },
  bubbleRow: { marginVertical: 6, flexDirection: "row" },
  bubbleAI: {
    maxWidth: "78%",
    backgroundColor: "#F5F7F6",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    marginLeft: "auto",
    maxWidth: "78%",
    backgroundColor: "#DDF4E9",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderBottomRightRadius: 4,
  },
  bubbleTitle: {
    fontFamily: fonts.family.bold,
    color: colors.neutral[900],
    marginBottom: 4,
    fontSize: 13,
  },
  bubbleText: {
    fontFamily: fonts.family.regular,
    color: colors.neutral[900],
    fontSize: 14,
    lineHeight: 20,
  },

  // Input bars
  bar: {
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#FFF",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 12,
    backgroundColor: "#FFF",
  },
  sendBtn: {
    height: 44,
    paddingHorizontal: 16,
    backgroundColor: colors.primary[500],
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sendTxt: { color: "#FFF", fontFamily: fonts.family.bold },

  attachBtn: {
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
  attachTxt: { fontFamily: fonts.family.medium, color: colors.neutral[900] },
});
