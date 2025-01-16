import { useDispatch, useSelector } from "react-redux";

import { Button, View } from 'react-native';
import { ThemedModal } from '../themed/ThemedModal';
import { ThemedText } from '../themed/ThemedText';
import { RootReducer } from "@/store";
import { setRequest } from "@/store/reducers/appReducer";



export default function GameRequest({ sendWS }: { sendWS: (dict: WebSocketData) => void }) {
    const dispatch = useDispatch();
    const requests = useSelector((state: RootReducer) => state.appReducer.data).game.requests
    console.log('requests', requests)

    return (
        <ThemedModal
            visible={Boolean(requests)}
            hideCloseButton
            title={requests?.title}
        >
            <ThemedText>
                {requests?.content}
            </ThemedText>
            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-around' }}>
                <Button
                    title='Aceitar' color={'green'}
                    onPress={() => {
                        sendWS({
                            ...requests!.data,
                                data_command: requests!.data_command.replace('request_', ''),
                        })
                        console.log("Aceitou");
                        dispatch(setRequest(undefined))
                    }}
                />
                <Button
                    title='Recusar' color={'red'}
                    onPress={() => {
                        // sendWS({
                        //     ...game.requests![0],
                        //     data_command: 'request_refused',
                        // })
                        console.log("Recusou")
                        dispatch(setRequest(undefined))
                    }}
                />
            </View>
        </ThemedModal>
    )
}