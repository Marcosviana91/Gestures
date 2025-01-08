import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { RootReducer } from "@/store";

import PlayerAvatar64 from "@/components/PlayerAvatar64";
import { ThemedModal } from "@/components/themed/ThemedModal";
import { ThemedText } from "@/components/themed/ThemedText";
import { ThemedView } from "../themed/ThemedView";

import { game } from '@/utils/game';
import { setPage } from "@/store/reducers/appReducer";


export default function Header({ sendWS }: { sendWS: (dict: {}) => void }) {
    const dispatch = useDispatch();
    const userData = useSelector((state: RootReducer) => state.dataAuthReducer.data)
    const [showExitModal, setShowExitModal] = useState(false)

    useEffect(() => {
        if (!game.match_id) {
            game.reset()
            dispatch(setPage('home'))
        }
    })

    return (
        <ThemedView>
            <ThemedModal
                title="Sair da Partida?"
                hideCloseButton
                backgroundTransparent
                dismissable
                visible={showExitModal}
                closeModal={() => {
                    setShowExitModal(false)
                }}
                onRequestClose={() => {
                    setShowExitModal(false)
                }}
            >
                <View style={{
                    width: '100%',
                    justifyContent: 'space-between'
                }}>
                    <ThemedText>'Sair da Partida' irá enviar ao servidor sua desistência.</ThemedText>
                    <ThemedText>'Ir para tela inicial' permite que você volte à esta partida..</ThemedText>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                        <Pressable
                            onPress={() => {
                                sendWS({
                                    'data_type': 'match_data',
                                    'data_command': 'leave_match',
                                    'data': {
                                        'match_id': game.match_id
                                    }
                                })
                                game.reset()
                                dispatch(setPage('home'))
                            }}
                        >
                            <View style={{
                                borderColor: '#f00',
                                borderWidth: 2,
                                borderRadius: 8,
                                width: 150,
                                padding: 8,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <ThemedText style={{ fontWeight: 700, color: '#770000', fontSize: 24, textAlign: 'center' }}>Sair da Partida</ThemedText>
                            </View>
                        </Pressable>
                        <Pressable
                            onPress={() => {
                                setShowExitModal(false)
                                dispatch(setPage('home'))
                            }}
                        >
                            <View style={{
                                borderColor: '#707070',
                                borderWidth: 2,
                                borderRadius: 8,
                                width: 150,
                                padding: 8,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <ThemedText style={{ fontWeight: 700, color: '#383838', fontSize: 24, textAlign: 'center' }}>Ir para tela inicial</ThemedText>
                            </View>
                        </Pressable>
                    </View>
                </View>
            </ThemedModal>
            <View style={{ flexDirection: 'row', gap: 6, padding: 8 }}>
                <View style={{ justifyContent: 'space-between', flexDirection: 'column' }}>
                    <ThemedText>Game: {game.game_id}</ThemedText>
                    <ThemedText>Match: {game.match_id}</ThemedText>
                    <ThemedText>Players: {game.players.map((id) => `${id} `)}</ThemedText>
                </View>
                {/* Botão de sair da conta */}
                <Pressable
                    style={{
                        position: 'absolute',
                        right: 8, bottom: 8,
                        borderColor: '#f00',
                        borderWidth: 1,
                        borderRadius: 4,
                        paddingHorizontal: 2,
                        justifyContent: 'center', alignItems: 'center'
                    }}
                    onPress={() => {
                        setShowExitModal(true)
                    }}
                >
                    <ThemedText style={{ fontSize: 12 }}>Sair da Partida</ThemedText>
                    <ThemedText style={{ lineHeight: 24 }}>
                        <MaterialIcons name="exit-to-app" size={24} />
                    </ThemedText>
                </Pressable>
                <PlayerAvatar64 size={50} file_name={userData.avatar} />
                <View style={{ justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                        <ThemedText>{userData.username}</ThemedText>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                        <ThemedText>ID:</ThemedText>
                        <ThemedText>{userData.id}</ThemedText>
                    </View>
                </View>
            </View>
        </ThemedView>
    )
}