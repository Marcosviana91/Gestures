import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { View, Pressable, TextInput } from "react-native";

import useAppWebSocket from '@/hooks/useAppWebSocket'
import { RootReducer } from "@/store";
import { setPage, addNotification, setRequest } from "@/store/reducers/appReducer";

import { ConnectionStatus } from "@/components/connectionSpot";
import { ThemedModal } from "@/components/themed/ThemedModal";
import { game } from '@/utils/game';
import { ThemedText } from "@/components/themed/ThemedText";
import Room from "@/components/game/Room";

import FontAwesome from '@expo/vector-icons/FontAwesome';

import Table from "@/components/game/Table";
import Header from "@/components/game/Header";
import { ThemedView } from "@/components/themed/ThemedView";
import NotificationContainer from "@/components/game/GameNotifications";
import GameRequest from "@/components/game/GameRequest";


export default function Game() {
    const dispatch = useDispatch();
    const appData = useSelector((state: RootReducer) => state.appReducer.data)

    const [creatingRoom, setCreatingRoom] = useState(false)
    const [requestRoomPassword, setRequestRoomPassword] = useState(false)
    const [roomPassword, setRoomPassword] = useState('')

    const WS = useAppWebSocket()

    function sendDataToWS(data: {}) {
        data = {
            ...data,
            'game_id': game.game_id,
        }
        WS.sendJsonMessage(data)
    }

    if (game.game_id === 0) {
        dispatch(setPage('home'))
    }

    // useEffect(() => {
    // const refresh = setInterval(() => {
    //     sendDataToWS({
    //         'data_type': 'game_server',
    //         'data_command': 'get_rooms',
    //     })
    // }, 1500);

    // return () => { clearInterval(refresh) }
    // }, [])

    // Create notifications and request
    useEffect(() => {
        const WS_DATA = WS.lastJsonMessage as WebSocketData
        if (WS_DATA) {
            if (WS_DATA.data_type === 'game_notification') {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                let _notification: GameNotification = {
                    data_command: WS_DATA.data_command,
                    content: '',
                    player_id: WS_DATA.player_id!,
                    title: '',
                    id: Date.now(),
                }
                switch (WS_DATA.data_command) {
                    case 'leave_match':
                        _notification.title = `Sair da Partido.`
                        _notification.content = `O jogador ${WS_DATA.player_id} deixou a partida.`
                        break;
                    case 'set_deck':
                        _notification.title = `Mudança de Deck.`
                        _notification.content = `O jogador ${WS_DATA.player_id} mudou o Deck.`
                        break;
                    case 'give_card':
                        _notification.title = `Compra de Carta.`
                        _notification.content = `O jogador ${WS_DATA.player_id} comprou uma carta.`
                        break;
                    case 'shuffle_card':
                        _notification.title = `Embaralhou Deck.`
                        _notification.content = `O jogador ${WS_DATA.player_id} embaralhou o Deck.`
                        break;
                    case 'get_card':
                        _notification.title = `Escolheu uma Carta.`
                        _notification.content = `O jogador ${WS_DATA.player_id} Escolheu uma carta.`
                        break;
                    case 'change_faith_points':
                        _notification.title = `Alterou seus Pontos.`
                        _notification.content = `O jogador ${WS_DATA.player_id} alterou seus pontos.`
                        break;
                    case 'back_to_deck':
                        _notification.title = `Devolveu uma carta.`
                        _notification.content = `O jogador ${WS_DATA.player_id} devolveu uma carta.`
                        break;
                    case 'change_card_owner':
                        _notification.title = `Troca de Dono.`
                        _notification.content = `O jogador ${WS_DATA.player_id} trocou a carta.`
                        break;
                    default:
                        return;
                }
                dispatch(addNotification(_notification))
                console.log("WS.lastJsonMessage", WS.lastJsonMessage)
                console.log(_notification)
            } else if (WS_DATA.data_type === 'match_data' && WS_DATA.data_command.startsWith('request_')) {
                let new_request: GameRequest = {
                    title:'',
                    content:"",
                    data_command: WS_DATA.data_command,
                    player_target_id: WS_DATA.data.player_target_id!,
                    player_trigger_id: WS_DATA.data.player_trigger_id!,
                    data: WS_DATA
                }
                switch (WS_DATA.data_command) {
                    case 'request_change_card_owner':
                        new_request.title = "Dar a carta."
                        new_request.content = `O jogador ${new_request.player_trigger_id} está solicitando a carta ${WS_DATA.data.card?.in_game_id}`
                        dispatch(setRequest(new_request))
                        break;
                    default:
                        break;
                }
            }
        }
    }, [WS.lastJsonMessage])


    if (game.players_stats.length > 0) {
        return (
            <>
                <View style={{ zIndex: 999, backgroundColor: 'white' }}>
                    <Header sendWS={sendDataToWS} />
                </View>
                <ConnectionStatus wsState={game.connection_status} />
                <Table sendWS={sendDataToWS} />
                <GameRequest sendWS={sendDataToWS} />
                <NotificationContainer />
            </>
        )
    }

    return (
        <ThemedView
            style={{ padding: 8, flex: 1 }}
        >
            <ConnectionStatus wsState={game.connection_status} />
            <ThemedModal
                visible={creatingRoom}
                transparent
                title={`${game.game_id}: ${appData.selected_game_details?.title}`}
                closeModal={() => {
                    setCreatingRoom(false)
                }}
                onRequestClose={() => {
                    setCreatingRoom(false)
                }}
            >
                <ThemedView
                    style={{ flex: 1, width: "100%" }}
                >
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <ThemedText>Senha:</ThemedText>
                        <TextInput
                            style={{
                                flex: 1,
                                borderColor: '#555',
                                borderWidth: 1,
                                borderRadius: 4,
                                paddingVertical: 2,
                                paddingHorizontal: 8,
                                color: '#555',
                            }}
                            value={roomPassword}
                            onChangeText={setRoomPassword}
                            placeholder="Deixe vazio para não usar senha"
                            placeholderTextColor='#555'
                        />
                    </View>
                    <Pressable
                        style={{ position: 'absolute', bottom: 0, width: '100%' }}
                        onPress={() => {
                            sendDataToWS({
                                'data_type': 'game_server',
                                'data_command': 'create_room',
                                'data': {
                                    'password': roomPassword,
                                }
                            })
                            setRoomPassword('')
                            setCreatingRoom(false)
                        }}
                    >
                        <View
                            style={{
                                borderColor: 'white',
                                borderWidth: 1,
                                borderRadius: 8,
                                paddingVertical: 4
                            }}
                        >
                            <ThemedText style={{ textAlign: 'center' }}>Criar</ThemedText>
                        </View>
                    </Pressable>
                </ThemedView>
            </ThemedModal>
            <Pressable
                onPress={() => {
                    dispatch(setPage('home'))
                }}
            >
                <View style={{
                    padding: 12,
                    borderColor: '#555',
                    borderWidth: 1,
                }}>
                    <ThemedText>Ir para o Início</ThemedText>
                </View>
            </Pressable>
            <ThemedText>{appData.selected_game_details?.title}</ThemedText>
            <Pressable
                onPress={() => {
                    setCreatingRoom(true)
                }}
            >
                <View
                    style={{
                        padding: 12,
                        borderColor: '#555',
                        borderWidth: 1
                    }}
                >
                    <ThemedText>Criar Sala
                        <FontAwesome name="group" size={18} />
                    </ThemedText>
                </View>
            </Pressable>
            {/* Room list */}
            <View>
                <ThemedText style={{ textAlign: 'center' }}>Salas</ThemedText>
                <Pressable
                    style={{ margin: 16, borderColor: '#555', borderRadius: 4, borderWidth: 1 }}
                    onPress={() => {
                        sendDataToWS({
                            'data_type': 'game_server',
                            'data_command': 'get_rooms',
                        })
                    }}
                >
                    <ThemedText style={{ textAlign: 'center' }}>Refresh</ThemedText>
                </Pressable>
                {game.room_list &&
                    <View
                        style={{
                            gap: 8
                        }}
                    >
                        {game.room_list.map(room => (
                            <View key={room.id}>
                                <Pressable
                                    onPress={() => {
                                        if (!room.has_password) {
                                            sendDataToWS({
                                                'data_type': 'game_server',
                                                'data_command': 'enter_room',
                                                'data': {
                                                    'room_id': room.id,
                                                    'password': roomPassword
                                                },
                                            })
                                        } else {
                                            setRequestRoomPassword(true)
                                        }
                                    }}
                                >
                                    <View
                                        style={{
                                            padding: 12,
                                            borderColor: '#555',
                                            borderWidth: 1,
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <ThemedText>{room.id}</ThemedText>
                                        <ThemedText>{room.players.length}/5</ThemedText>
                                        <ThemedText>{room.has_password
                                            ? <FontAwesome name="lock" size={24} />
                                            : <FontAwesome name="unlock" size={24} />
                                        }</ThemedText>
                                    </View>
                                </Pressable>
                                <ThemedModal
                                    visible={requestRoomPassword}
                                    closeModal={() => { setRequestRoomPassword(false) }}
                                    title="Esta sala requer uma senha"
                                >
                                    <View style={{ flexDirection: 'row', gap: 8, alignContent: 'center' }}>
                                        <ThemedText>Senha:</ThemedText>
                                        <TextInput
                                            style={{
                                                flex: 1,
                                                borderColor: '#555',
                                                borderWidth: 1,
                                                borderRadius: 4,
                                                paddingVertical: 2,
                                                paddingHorizontal: 8,
                                                color: '#555',
                                            }}
                                            value={roomPassword}
                                            onChangeText={setRoomPassword}
                                        />
                                    </View>
                                    <Pressable
                                        style={{ borderColor: '#48ff00', borderWidth: 1, padding: 8, borderRadius: 8 }}
                                        onPress={() => {
                                            sendDataToWS({
                                                'data_type': 'game_server',
                                                'data_command': 'enter_room',
                                                'data': {
                                                    'room_id': room.id,
                                                    'password': roomPassword
                                                },
                                            })
                                        }}
                                    >
                                        <ThemedText>ENTRAR</ThemedText>
                                    </Pressable>
                                </ThemedModal>
                            </View>

                        ))}
                    </View>
                }
            </View>
            {game.match_id !== '' &&
                <Room sendWS={sendDataToWS} />
            }
            <NotificationContainer />
        </ThemedView>
    )
}