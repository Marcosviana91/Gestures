import { useEffect } from "react";
import { View, Pressable } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";

import { removeNotification } from "@/store/reducers/appReducer";
import { ThemedView } from "../themed/ThemedView";
import { ThemedText } from "../themed/ThemedText";
import { RootReducer } from "@/store";

export default function NotificationContainer() {
    const appData = useSelector((state: RootReducer) => state.appReducer.data)

    if (!appData.game.nofifications) { return undefined}

    return (
        <View style={{
            position: 'absolute', bottom: 12, right: 12,
            width: 200,
            rowGap: 4
        }}>
            {appData.game.nofifications.map(notif => (
                <Notification key={notif.id} id={notif.id} content={notif.content} data_command={notif.data_command} player_id={1} title={notif.title} />
            ))}



        </View>
    )
}

function Notification(props: GameNotification) {
    const dispatch = useDispatch();
    const SV_timeout_line_width = useSharedValue(100);

    const STYLE_timeout_line = useAnimatedStyle(() => {
        return {
            width: `${SV_timeout_line_width.value}%`,
            height: 6,
            backgroundColor: '#555',
            position: 'absolute',
            top: 0,
            right: 4,
            borderRadius: 4
        };
    });

    useEffect(() => {
        SV_timeout_line_width.value = withTiming(0, { duration: 5000 })
        setTimeout(() => {
            dispatch(removeNotification(props.id!));
        }, 5000)
    }, [])

    return (
        <Pressable
            onPress={() => {
                dispatch(removeNotification(props.id!));
            }}
        >
            <ThemedView
                style={{
                    borderRadius: 8,
                    borderColor: '#555',
                    borderWidth: 1,
                    padding: 4
                }}
            >
                <Animated.View style={STYLE_timeout_line} />
                <ThemedText style={{ marginVertical: 2, fontSize: 12, lineHeight: 14 }}>{props.title}</ThemedText>
                <ThemedText style={{ fontSize: 8, lineHeight: 10 }}>{props.content}</ThemedText>
            </ThemedView>
        </Pressable>
    )
}