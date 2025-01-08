import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { View, Text, Image, Pressable, Linking } from "react-native";

import { RootReducer } from "@/store";
import { useGetGameDetailsQuery, useGetGameDLCQuery } from "@/store/api";
import { setPage, setSelectedGame } from "@/store/reducers/appReducer";

import { getGameMediaFiles, checkGameMediaFiles } from "@/utils/FileSystem/Media";
import { ThemedText } from "./themed/ThemedText";

const SITE = process.env.EXPO_PUBLIC_SITE_URL;

export default function GameDetails(props: { game_id: string }) {
    const dispatch = useDispatch();
    const appData = useSelector((state: RootReducer) => state.appReducer.data)
    const { data: game_data } = useGetGameDetailsQuery(props.game_id)
    const { data: game_dlc } = useGetGameDLCQuery(props.game_id)
    const [gameReady, setGameReady] = useState<Boolean>(false);

    useEffect(() => {
        if (game_data) {
            dispatch(setSelectedGame(game_data))
        }
    }, [game_data])

    useEffect(() => {
        if (game_dlc) {
            checkGameMediaFiles(game_dlc).then(files => {
                setGameReady(Boolean(files.length === 0))
            })
        }
    }, [game_dlc])

    return (
        <View>
            {appData.selected_game_details &&
                <View>
                    <ThemedText type="title" style={{ alignSelf: 'center', marginBottom: 12, fontWeight: 700, marginTop:12 }}>{appData.selected_game_details.title}</ThemedText>
                    <View style={{ flexDirection: 'row', padding: 12, gap: 8 }}>
                        <Image
                            style={{ width: 200, height: 200 }}
                            src={`${SITE}${appData.selected_game_details.image}`}
                        />
                        <ThemedText style={{ flex: 1, textAlign: 'justify', fontSize: 18 }}>{appData.selected_game_details.description}</ThemedText>

                    </View>
                    <Pressable
                        onPress={() => {
                            Linking.canOpenURL(`${SITE}/games/${props.game_id}`).then(() => {
                                Linking.openURL(`${SITE}/games/${props.game_id}`)
                            })
                        }}
                    >
                        <View style={{
                            backgroundColor: '#060',
                            padding: 8,
                            margin: 8,
                            borderColor: '#fff',
                            borderWidth: 2,
                            borderRadius: 8,
                        }}>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: 700,
                                textAlign: "center",
                            }}>Ver mais detalhes</Text>
                        </View>
                    </Pressable>
                    {!gameReady
                        ? <Pressable
                            onPress={() => {
                                if (game_dlc) {
                                    getGameMediaFiles(game_dlc).then(ready => setGameReady(ready))
                                }
                            }}
                        >
                            <View style={{
                                backgroundColor: '#0f0',
                                padding: 8,
                                margin: 8,
                                borderColor: '#fff',
                                borderWidth: 2,
                                borderRadius: 8,
                            }}>
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: 700,
                                    textAlign: "center",
                                }}>Baixar Jogo</Text>
                            </View>
                        </Pressable>
                        : <Pressable
                            onPress={() => {
                                dispatch(setPage('game'))
                            }}
                        >
                            <View style={{
                                backgroundColor: '#0f0',
                                padding: 8,
                                margin: 8,
                                borderColor: '#fff',
                                borderWidth: 2,
                                borderRadius: 8,
                            }}>
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: 700,
                                    textAlign: "center",
                                }}>Jogar</Text>
                            </View>
                        </Pressable>
                    }
                </View>
            }
        </View>
    )
}