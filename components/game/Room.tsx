import { useSelector } from "react-redux";
import { Pressable, View, Text } from "react-native";

import { RootReducer } from "@/store";
import { ThemedModal } from "../themed/ThemedModal";
import { ThemedText } from "../themed/ThemedText";
import { ThemedView } from "../themed/ThemedView";

import { game } from '@/utils/game';

export default function Room({ sendWS }: { sendWS: (dict: {}) => void }) {
    const userData = useSelector((state: RootReducer) => state.dataAuthReducer.data)
    return (
        <ThemedModal
            hideCloseButton
            title={`Sala ${game.match_id}`}
        >
            <View style={{ width: '100%', justifyContent: 'space-between' }}>
                <View>
                    <ThemedText>Lista de Jogadores Conectados</ThemedText>
                    <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'space-evenly', paddingVertical: 16 }}>
                        {game.players.map(p => {
                            if (game.players_ready.includes(p)) {
                                return (
                                    <ThemedText key={p} style={{ fontWeight: 900, fontSize: 24, opacity: .5 }}>{p}</ThemedText>
                                )
                            }
                            return (
                                <ThemedText key={p} style={{ fontWeight: 900, fontSize: 24 }}>{p}</ThemedText>
                            )
                        })}
                    </View>
                </View>
                {/* Buttons */}
                <View
                    style={{ flexDirection: 'row', justifyContent: 'space-between' }}
                >
                    <Pressable
                        disabled={game.players_ready && !!game.players_ready.find(p => p === userData.id)}
                        onPress={() => {
                            sendWS({
                                'data_type': 'game_server',
                                'data_command': 'user_ready',
                            })
                        }}
                    >
                        <ThemedView style={{
                            width: 120, height: 40,
                            justifyContent: "center", alignItems: "center",
                            borderRadius: 8, borderWidth: 1
                        }}>
                            <ThemedText>Pronto!</ThemedText>
                        </ThemedView>
                    </Pressable>
                    <Pressable
                        onPress={() => {
                            sendWS({
                                'data_type': 'game_server',
                                'data_command': 'leave_room',
                            })
                        }}
                    >
                        <ThemedView style={{
                            width: 120, height: 40,
                            justifyContent: "center", alignItems: "center",
                            borderRadius: 8, borderWidth: 1
                        }}>
                            <ThemedText>Sair!</ThemedText>
                        </ThemedView>
                    </Pressable>
                </View>
            </View>
        </ThemedModal>
    )
}