import { colors, fonts } from "@/src/styles/styles";
import { StyleSheet } from "react-native";

export const s = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.neutral.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {

    },
    container: {
        width: '90%',
        height: '60%',
        paddingTop: 40,
        alignItems: 'center',
        backgroundColor: colors.primary[500],
        borderRadius: 20,
    },
    title: {
        fontFamily: fonts.family.bold,
        fontSize: fonts.size["2xl"],
        color: colors.neutral.white,
        width: '80%',
    },
    form: {
        alignItems: 'center',
        width: '100%',
        marginTop: 60,
    },
    label: {
        fontFamily: fonts.family.bold,
        fontSize: fonts.size.lg,
        color: colors.neutral.white,
        width: '80%',
        marginTop: 30,
    },
    input: {
        width: '80%',
        height: 40,
        backgroundColor: colors.neutral.white,
        color: colors.neutral[900],
        borderRadius: 20,
        paddingHorizontal: 10,
        fontFamily: fonts.family.medium,
        fontSize: fonts.size.md,
    },
    viewDescription: {
        flexDirection: "row",    
        justifyContent: "center",
        alignItems: "center",    
        marginTop: 20,           
        gap: 6,                  
    },
    description: {
        fontFamily: fonts.family.regular,
        fontSize: fonts.size.sm,
        color: colors.neutral.white,
    },
    link: {
        fontFamily: fonts.family.medium,
        fontSize: fonts.size.md,
        color: colors.primary[300],
        textDecorationLine: "underline",
    },
    containerButton: {
        width: '60%',
        height: 140,
        justifyContent: 'flex-end',
    },
    button: {
        width: '100%',
        height: 40,
        backgroundColor: colors.neutral.white,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textButton: {
        fontFamily: fonts.family.bold,
        color: colors.neutral[900],
    }
})