import useWebSocket from 'react-use-websocket';

import { useEffect } from 'react';
import { game } from '@/utils/game';
import { getData } from '@/store/database';

const URL = process.env.EXPO_PUBLIC_API_URL;

export default function useAppWebSocket() {
    var access_token = ''
    getData('userDataAuth').then(_data => {
        if (_data) {
            access_token = _data['access_token'];
        }
    })

    const WS = useWebSocket(`ws://${URL}/ws/flat`, {
        share: true,
        onOpen: () => {
            WS.sendJsonMessage(
                {
                    "data_type": "create_connection",
                    "access_token": access_token
                }
            )
        },
        onMessage: ({ data }) => {
            const msg = JSON.parse(data) as WebSocketData
            console.log('RECV <<< : ', msg)
            game.handleWS(msg)
        },
        shouldReconnect: () => Boolean(1),
        reconnectInterval: 1500,
        retryOnError: true,
    })

    useEffect(() => {
        game.connection_status = WS.readyState
    }, [WS.readyState])

    return WS
}

