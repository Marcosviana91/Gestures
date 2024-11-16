import { Pressable, View, Text } from "react-native";
import { ConnectionStatus } from "./connectionSpot";

import { useDispatch, useSelector } from "react-redux";
import { RootReducer } from "@/store";
import { logout } from "@/store/reducers/fakeAuthReducer";
import { game } from '@/utils/game';


export default function Header({ sendWS }: { sendWS: (data: {}) => void }) {
    const dispatch = useDispatch();
    const fakeUserData = useSelector((state: RootReducer) => state.fakeAuthReducer.data)
    return (
        <View style={{ zIndex: 999, backgroundColor: '#ccc', width: '100%', height: 50, justifyContent: 'space-around', alignItems: 'center', flexDirection: 'row' }}>
            <Text>Sala: {fakeUserData.match}</Text>
            <Text>Nome: {fakeUserData.name}</Text>
            <Pressable
                onPress={() => {
                    dispatch(logout())
                    game.reset()
                    sendWS({
                        data_type: 'leave_room',
                        player: fakeUserData.name,
                        room: fakeUserData.match
                    })
                }}>
                <View style={{ borderWidth: 1, borderRadius: 8, width: 75, backgroundColor: '#f33', justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Logout</Text>
                </View>
            </Pressable>
            {/* <ConnectionStatus wsState={props.wsState} /> */}
        </View>
    )
}