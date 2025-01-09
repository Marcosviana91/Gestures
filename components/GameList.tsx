import { useState, useEffect } from "react";
import { View, Pressable, BackHandler, Alert, ToastAndroid } from "react-native";
import { ThemedModal } from "@/components/themed/ThemedModal";

import { useGetGameListQuery } from '@/store/api'
import { ThemedText } from "./themed/ThemedText";
import { ThemedView } from "./themed/ThemedView";
import GameDetails from "./GameDetails";

import { game } from '@/utils/game';

export default function GameList() {
    const dataGameList = useGetGameListQuery()
    const [showGameList, setShowGameList] = useState(false)
    const [gameList, setGameList] = useState([])
    const [selectedGame, setSelectedGame] = useState<number>()

    useEffect(() => {
        const backAction = () => {
            Alert.alert('Sair do jogo?', 'Você está encerrando o aplicativo. Está certo?', [
                {
                    text: 'Cancelar',
                    onPress: () => null,
                    style: 'cancel',
                },
                { text: 'SAIR', onPress: () => BackHandler.exitApp() },
            ],
                {
                    cancelable: true,
                }
            );
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );

        return () => backHandler.remove();
    }, [])

    useEffect(() => {
        if (dataGameList.data) {
            setGameList(Object.entries(dataGameList.data) as never)
        }
    }, [dataGameList.data])

    useEffect(() => {
        if (typeof selectedGame === 'number') {
            game.game_id = gameList[selectedGame][0]
        }
    }, [selectedGame])


    return (
        <View style={{}}>
            <ThemedModal
                visible={showGameList}
                title="Jogos disponíveis"
                dismissable
                closeModal={() => { setShowGameList(false) }}
                onRequestClose={() => { setShowGameList(false) }}
            >
                <View style={{ width: '100%', gap: 8 }}>
                    {gameList.map((game, _index) => (
                        <Pressable
                            key={_index}
                            onPress={() => {
                                setSelectedGame(_index)
                                setShowGameList(false)
                            }}
                            style={{ width: '100%' }}
                        >
                            <ThemedView style={{ flexDirection: 'row', borderWidth: 1, padding: 4, width: '100%', borderRadius: 6, justifyContent: 'center' }}>
                                <ThemedText>{game[0]}: </ThemedText>
                                <ThemedText>{game[1]}</ThemedText>
                            </ThemedView>
                        </Pressable>

                    ))}
                </View>
            </ThemedModal>
            <Pressable
                onPress={() => {
                    setShowGameList(true)
                    if (!dataGameList.data) {
                        dataGameList.refetch()
                        ToastAndroid.show('Refeching game list...', ToastAndroid.SHORT)
                    }
                }}
            >
                <View style={{
                    borderColor: 'cyan',
                    borderWidth: 1,
                    padding: 8,
                }}>
                    {selectedGame === undefined
                        ? <ThemedText>Selecione um Jogo</ThemedText>
                        : <ThemedText>{gameList[selectedGame][1]}</ThemedText>
                    }
                </View>
            </Pressable>
            {typeof (selectedGame) == 'number' &&
                (<GameDetails game_id={gameList[selectedGame!][0]} />)
            }
        </View>
    )
}
