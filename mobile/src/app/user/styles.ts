import { StyleSheet } from "react-native";
import { colors, fonts } from "@/src/styles/styles";

export const s = StyleSheet.create({
  screenLoading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  container: {
    padding: 16,
    paddingBottom: 24,
  },

  title: {
    fontFamily: fonts.family.bold,
    fontSize: fonts.size.xl,
    marginBottom: 12,
    color: colors.neutral[900],
  },

  errorBox: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FFF3F0",
    borderWidth: 1,
    borderColor: "#FFD2C7",
  },

  errorText: {
    color: "#9C3118",
    fontFamily: fonts.family.medium,
  },

  card: {
    borderWidth: 1,
    borderColor: "#EEF1EF",
    borderRadius: 12,
    backgroundColor: "#FFF",
    padding: 16,
    gap: 8,
  },

  row: {
    flexDirection: "row",
    gap: 8,
  },

  rowLabel: {
    width: 120,
    color: colors.neutral[900],
    fontFamily: fonts.family.medium,
  },

  rowValue: {
    flex: 1,
    color: colors.neutral[900],
    fontFamily: fonts.family.regular,
  },
  button: {
      width: '80%',
      height: 50,
      backgroundColor: colors.secondary[600],
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      marginTop: 40,
  },
  textButton: {
      fontFamily: fonts.family.bold,
      color: colors.neutral.white,
  },
});
