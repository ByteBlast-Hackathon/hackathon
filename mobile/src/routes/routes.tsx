import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../app/login/index";
import RegisterScreen from "../app/register/index";
import UserScreen from "../app/user";
import AskAI from "../app/chat/AskAI";
import VerifyExam from "../app/chat/VerifyExam";
import BookAppointment from "../app/chat/BookAppointment";
import AmbulanceDemo from "../app/ambulance";

const Stack = createNativeStackNavigator();

export default function Routes() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="User"
          component={UserScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AskAI"
          component={AskAI}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="VerifyExam"
          component={VerifyExam}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="BookAppointment"
          component={BookAppointment}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="SOS"
          component={AmbulanceDemo}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
