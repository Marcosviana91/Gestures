import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { View, Text, Image, Pressable, Linking, Platform, ActivityIndicator } from "react-native";

import { RootReducer } from "@/store";
import { useGetGameDetailsQuery, useGetGameDLCQuery } from "@/store/api";
import { setPage, setSelectedGame } from "@/store/reducers/appReducer";

import { getGameMediaFiles, checkGameMediaFiles } from "@/utils/FileSystem/Media";
import { ThemedText } from "./themed/ThemedText";
import FullLoading from "./general/Loading";

const SITE = process.env.EXPO_PUBLIC_SITE_URL;

export default function GameDetails(props: { game_id: string }) {
    const dispatch = useDispatch();
    const appData = useSelector((state: RootReducer) => state.appReducer.data)
    const { data: game_data } = useGetGameDetailsQuery(props.game_id)
    const { data: game_dlc } = useGetGameDLCQuery(props.game_id)
    const [gameReady, setGameReady] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (game_data) {
            dispatch(setSelectedGame(game_data))
            setLoading(false)
        }
    }, [game_data])

    useEffect(() => {
        if (game_dlc) {
            console.log("Checando arquivos locais")
            Platform.OS === 'android' && checkGameMediaFiles(game_dlc).then(files => {
                setGameReady(Boolean(files.length === 0))
                console.log("Arquivos locais checados")
            })
        }
    }, [game_dlc])

    return (
        <View style={{ height: '85%' }}>
            {loading && <FullLoading />}
            {appData.selected_game_details &&
                <>
                    <ThemedText type="title" style={{ alignSelf: 'center', marginBottom: 12, fontWeight: 700, marginTop: 12 }}>{appData.selected_game_details.title}</ThemedText>
                    <View style={{ flexDirection: 'row', padding: 12, gap: 8 }}>
                        <Image
                            style={{ width: 200, height: 200 }}
                            src={`${SITE}${appData.selected_game_details.image}`}
                        />
                        <ThemedText style={{ flex: 1, textAlign: 'justify', fontSize: 18 }}>{appData.selected_game_details.description}</ThemedText>

                    </View>
                    <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-evenly', position: 'absolute', bottom: 20 }}>
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
                                disabled={loading}
                                style={{ width: '50%' }}
                                onPress={() => {
                                    setLoading(true)
                                    if (game_dlc) {
                                        getGameMediaFiles(game_dlc).then(ready => {
                                            setGameReady(ready)
                                            setLoading(false)
                                        })
                                    }
                                }}
                            >

                                <View style={{
                                    backgroundColor: loading ? '#00ff0033' : '#0f0',
                                    padding: 8,
                                    margin: 8,
                                    borderColor: '#fff',
                                    borderWidth: 2,
                                    borderRadius: 8,
                                }}>
                                    {loading
                                        ? (<ActivityIndicator />)
                                        : <Text style={{
                                            fontSize: 16,
                                            fontWeight: 700,
                                            textAlign: "center",
                                        }}>Baixar Jogo</Text>
                                    }

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
                </>
            }
        </View>
    )
}