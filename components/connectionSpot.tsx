// A single point to reveal WS connection status
import { View, StyleSheet } from "react-native";


export function ConnectionStatus(props: {wsState: number}) {

    const connectionStatusColor = [
        '#030',
        '#0F0',
        '#300',
        '#F00',
        '#777',
    ]


    const style = StyleSheet.create({
        point: {
            width: 10,
            height: 10,
            borderRadius: 5,
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 999,
            backgroundColor: connectionStatusColor[props.wsState]
        },
        not_connected: {
            borderRadius: 0,
            width: "100%",
        }

    })

    return (
        <View style={[style.point, props.wsState == 3 && style.not_connected]} />
    )
}