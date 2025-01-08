import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "@/store";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemedView } from "@/components/themed/ThemedView";

export default function RootLayout() {
    return (
        <SafeAreaProvider style={{ flex: 1 }}>
            <Provider store={store}>
                {Platform.OS === 'android' &&
                    <ThemedView style={{ width: '100%', height: 32 }} />}
                <Stack  >
                    <Stack.Screen options={{ headerShown: false }} name="index" />
                </Stack>
            </Provider>
        </SafeAreaProvider>
    );
}
