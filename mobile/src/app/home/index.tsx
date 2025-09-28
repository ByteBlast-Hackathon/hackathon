import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

function HomeScreen() {
    const navigation = useNavigation();

    return (
        <View>
            <Text>Home Screen</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login" as never)}>
                <Text>
                    Login Screen
                </Text>
            </TouchableOpacity>
        </View>
    )
}

export default HomeScreen;