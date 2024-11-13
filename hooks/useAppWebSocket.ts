import useWebSocket from 'react-use-websocket';

import { useDispatch, useSelector } from 'react-redux';
import { RootReducer } from '@/store';
import { setPlayers } from '@/store/reducers/cardMatchReducer';
import { game } from '@/utils/game';


export default function useAppWebSocket() {
    const dispatch = useDispatch();
    const fakeUserData = useSelector((state: RootReducer) => state.fakeAuthReducer.data)
    // const playersStore = useSelector((state: RootReducer) => state.cardMatchReducer.players)
    const WS = useWebSocket("ws://marcosvianadev2.ddns.net:3112/ws/flat", {
        share: true,
        onOpen: () => {
            // console.log({
            //     "data_type": "create_connection",
            //     "player_data": {
            //         "id": userData?.id,
            //         "token": userData?.token
            //     }
            // })
            WS.sendJsonMessage(
                {
                    "data_type": "create_connection",
                    "player_data": {
                        "name": fakeUserData.name,
                    }
                }
            )
        },
        onMessage: ({ data }) => {
            const msg = JSON.parse(data) as WebSocketData
            console.log('RECV <<< : ', msg)
            if (msg.data_type == 'accepted') {
                WS.sendJsonMessage({
                    'data_type': 'enter_room',
                    'data': {
                        'room': fakeUserData.match
                    }
                })
            }
            if (msg.data_type == 'start' && msg.room_stats) {
                dispatch(setPlayers(msg.room_stats.players))
                game.id = msg.room_stats.id
                game.players = msg.room_stats.players
                game.players_stats = msg.room_stats.players_stats
                console.log(game)
            }
            if (msg.data_type == 'card_move') {
                // if (msg.player !== fakeUserData.name) {
                // console.log("Oponent card_move")
                game.setCardsOrder(msg.card!)
                // }
            }
            if (msg.data_type == 'give_card') {
                console.log("Recebeu uma carta")
                if (msg.card) {
                    game.setCardsOrder(msg.card!)
                    game.removeCardFromDeck(msg.card!)
                } else {
                    // TODO: exibir deck vazio
                    console.log("Não tem mais cartas")
                }
            }
            if (msg.data_type == 'back_to_deck') {
                console.log("Devolver ao deck")
                if (msg.card) {
                    game.returnCardToDeck(msg.card!)
                }
            }
            if (msg.data_type == 'give_wisdom') {
                game.giveWisdom(msg.player!)
            }
            if (msg.data_type == 'take_wisdom') {
                game.takeWisdom(msg.player!)
            }
            if (msg.data_type == 'toggle_wisdom') {
                game.toggleWisdom(msg.player!, msg.increment!)
            }
            if (msg.data_type == 'change_faith_points') {
                game.changeFaithPoints(msg.player!, msg.faith_points!)
            }
        },
        shouldReconnect: () => Boolean(1),
        reconnectInterval: 50,
        retryOnError: true,
    })

    return WS
}

