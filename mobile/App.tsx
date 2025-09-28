import { useFonts, Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { View, ActivityIndicator } from 'react-native';
import Routes from './src/routes/routes';
import { colors } from './src/styles/styles';

export default function App() {
    const [fontsLoaded] = useFonts({
        Roboto_400Regular,
        Roboto_500Medium,
        Roboto_700Bold,
    });

    if (!fontsLoaded) {
        return (
            <View>
                <ActivityIndicator 
                    color={colors.neutral[900]}
                    size='large'
                />
            </View>
        )
    }

    return (
        <Routes />
    )
}