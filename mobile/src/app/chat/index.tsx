import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AskAI from "./AskAI";
import VerifyExam from "./VerifyExam";
import BookAppointment from "./BookAppointment";

export type ChatStackParamList = {
  AskAI: undefined;
  VerifyExam: undefined;
  BookAppointment: undefined;
};

const Stack = createNativeStackNavigator<ChatStackParamList>();

export default function ChatStack() {
  return (
    <Stack.Navigator
      initialRouteName="AskAI"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="AskAI" component={AskAI} />
      <Stack.Screen name="VerifyExam" component={VerifyExam} />
      <Stack.Screen name="BookAppointment" component={BookAppointment} />
    </Stack.Navigator>
  );
}
