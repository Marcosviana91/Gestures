import { useEffect, useState } from "react";
import { View, Pressable, Platform, Image, StyleSheet, ScrollView } from "react-native";

import { useDispatch, useSelector } from "react-redux";
import { RootReducer } from '@/store';
import { setGameSettings } from "@/store/reducers/appReducer";

import { ThemedText } from "../themed/ThemedText";
import { ThemedModal } from "../themed/ThemedModal";

import Ionicons from '@expo/vector-icons/Ionicons';

import { getMediaBase64 } from '@/utils/FileSystem/Media';
import { ThemedView } from "../themed/ThemedView";

export default function BoardSettings() {
    const dispatch = useDispatch();
    const appData = useSelector((state: RootReducer) => state.appReducer.data)
    const [showSettingsModal, setShowSettingsModal] = useState(false)
    return (<>
        <Pressable
            onPress={() => {
                setShowSettingsModal(true)
            }}
            style={{
                zIndex: 1,
                position: 'absolute',
                top: 8,
                left: 8
            }}>
            <View>
                <ThemedText>
                    <Ionicons name="settings-sharp" size={24} />
                </ThemedText>
            </View>
        </Pressable>
        <ThemedModal
            visible={showSettingsModal}
            closeModal={() => { setShowSettingsModal(false) }}
            dismissable
            title="Board Settings"
            backgroundTransparent
        >
            <View style={{  }}>
                <ThemedText type="subtitle">Board: {appData.selected_game_details?.gameBoard[appData.game.board_id].name}</ThemedText>
                <View style={{height:125}}>
                    <ScrollView
                        contentContainerStyle={{
                            gap: 12,
                        }}
                    >
                        {appData.selected_game_details?.gameBoard.map((board, _index) => (
                            <Pressable
                                key={_index}
                                onPress={() => {
                                    dispatch(setGameSettings({
                                        board_id: _index
                                    }))
                                }}
                            >
                                <MiniBoard board={board} />
                            </Pressable>
                        ))}
                    </ScrollView>

                </View>
            </View>
        </ThemedModal>
    </>
    )
}

function MiniBoard({ board }: {
    board: {
        name: string;
        image: string;
    }
}) {
    const appData = useSelector((state: RootReducer) => state.appReducer.data)

    // Image
    const [base64_board_string, setBase64_board_string] = useState('')

    const style = StyleSheet.create({
        image: {
            width: "100%",
            height: "100%",
            resizeMode: "stretch",
        }
    })

    // Set Playmat Image
    useEffect(() => {
        if (Platform.OS === 'android') {
            getMediaBase64(board.image).then(file => setBase64_board_string(file))
        }
    }, [])
    return (
        <View
            style={{
                width: 220,
                height: 100
            }}
        >
            <ThemedView
                style={{
                    position: 'absolute',
                    top: 4,
                    left: 4,
                    zIndex: 1,
                    opacity: .6
                }}
            >
                <ThemedText

                >{board.name}:</ThemedText>
            </ThemedView>
            {base64_board_string &&
                <Image
                    style={[style.image]}
                    source={{
                        uri: base64_board_string
                    }}
                />
            }
        </View>
    )
}