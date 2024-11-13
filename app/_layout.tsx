import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "@/store";
import { Platform, View } from "react-native";

export default function RootLayout() {
    return (
        <Provider store={store}>
            {Platform.OS === 'android' &&
            <View style={{width:'100%', height:32}} />}
            <Stack  >
                <Stack.Screen options={{headerShown: false}} name="index" />
            </Stack>
        </Provider>
    );
}
