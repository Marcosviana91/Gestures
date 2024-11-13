import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { ThemedText } from './themed/ThemedText';
import { View, Pressable } from 'react-native';
import { SharedValue } from "react-native-reanimated";

type Props = {
    scale: SharedValue<number>,
    is_zoom_in?: boolean,
    is_zoom_out?: boolean,
    reset_zoom: () => void,
}

export default function Magnify(props: Props) {
    return (
        <View style={{ zIndex: 100, flexDirection: 'row' }}>
            <Pressable
            onPress={props.reset_zoom}
            >
                <FontAwesome6 name="magnifying-glass" size={24} color="black" />
                <ThemedText style={{ color: 'black' }}>
                    1X
                    {/* {props.scale.value.toPrecision(2)}x */}
                </ThemedText>
            </Pressable>
        </View>
    )
}