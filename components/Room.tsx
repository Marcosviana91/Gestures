import { Pressable, View, Text } from "react-native";
import { ThemedModal } from "./themed/ThemedModal";
import { ThemedText } from "./themed/ThemedText";
import { game } from '@/utils/game';
import { ThemedView } from "./themed/ThemedView";
import { useSelector } from "react-redux";
import { RootReducer } from "@/store";

export default function Room({ sendWS }: { sendWS: (dict: {}) => void }) {
    const fakeUserData = useSelector((state: RootReducer) => state.fakeAuthReducer.data)
    return (
        <ThemedModal
            hideCloseButton
            title="Sala"
        >
            <View style={{ flex: 1, width: '100%' }}>
                <View>
                    <ThemedText>Lista de Jogadores Conectados</ThemedText>
                    {game.players.map(p => (
                        <ThemedText key={p}>{p}</ThemedText>
                    ))}
                </View>

                {game.players_ready && !game.players_ready.find(p => p === fakeUserData.name) &&
                    <Pressable
                        onPress={() => {
                            sendWS({
                                'data_type': 'user_ready',
                                'room': game.id
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
                }
            </View>
        </ThemedModal>
    )
}