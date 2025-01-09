import { useState } from 'react';
import { View, Pressable, ScrollView, Linking, ToastAndroid, useColorScheme } from 'react-native';

import * as DocumentPicker from 'expo-document-picker';
import { readFile } from "@/utils/FileSystem/Reader";

import { useSelector } from 'react-redux';
import { RootReducer } from '@/store';

import { ThemedText } from '../themed/ThemedText';
import { ThemedView } from '../themed/ThemedView';
import { ThemedModal } from '../themed/ThemedModal';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { game } from '@/utils/game';

export default function DeckLoader({ sendToWS, card_family }: { sendToWS: (data: WebSocketData) => void, card_family: string }) {
    const userData = useSelector((state: RootReducer) => state.dataAuthReducer.data)
    const [showModal, setShowModal] = useState(false)
    const [cardList, setCardList] = useState<string[]>([])
    const playerData = game.getPlayerData(userData.id)
    const theme = useColorScheme() // light | dark

    function prepareCardList() {
        function file_content(file_content: deckBuilderFromMateusCosta) {
            // TODO REMOVER ACENTUAÇÃO
            // THANKS https://pt.stackoverflow.com/questions/237762/remover-acentos-javascript
            console.log("file_content")
            let _temp_array: string[] = []
            file_content.forEach(card => {
                if (card.count === 2) {
                    _temp_array.push(card.name.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().replaceAll(" ", "-").replaceAll(",", ""));
                }
                _temp_array.push(card.name.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().replaceAll(" ", "-").replaceAll(",", ""));
            })
            setCardList(_temp_array)
        }

        DocumentPicker.getDocumentAsync()
            .then(data => {
                if (!data.canceled && data.output && data.output.length > 0 && data.output[0].type === 'application/json') {
                    data.output[0].text()
                        .then(text => { file_content(JSON.parse(text)) })
                } else if (!data.canceled && data.assets.length > 0 && data.assets[0].mimeType === 'application/json') {
                    readFile(data.assets[0].uri)
                        .then(text => { file_content(JSON.parse(text)) })
                }
            })
    }

    return (<>
        <Pressable
            onPress={() => {
                if (playerData && playerData.cards_in_game.length == 0) {
                    setShowModal(true)
                } else {
                    ToastAndroid.show('Remova todas suas cartas da mesa.', ToastAndroid.SHORT)
                }
            }}
        >
            <View style={{
                justifyContent: "center", alignItems: "center",
            }}>
                    <MaterialCommunityIcons name="cards" size={36} />
            </View>
        </Pressable>
        <ThemedModal
            title='Escolha o Deck'
            visible={showModal}
            closeModal={() => {
                setShowModal(false)
                setCardList([])
            }}
            dismissable
            backgroundTransparent
        >
            <ThemedText>{`Escolha o Deck para as cartas: ${card_family}`}</ThemedText>
            {cardList.length > 0
                ? <ScrollView
                    contentContainerStyle={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',

                    }}
                >
                    {cardList.map((card, _index) => (
                        <ThemedText key={_index} >{_index + 1}: {card} </ThemedText>
                    ))}
                </ScrollView>
                : <>
                    <Pressable
                        onPress={() => {
                            Linking.canOpenURL(`https://costamateus.com.br/faithbattle/deck`).then(() => {
                                Linking.openURL(`https://costamateus.com.br/faithbattle/deck`)
                            })
                        }}
                    >
                        <View style={{
                            backgroundColor: theme == 'light' ? '#5fff5f' : '#085708',
                            padding: 8,
                            margin: 8,
                            borderColor: theme == 'dark' ? '#5fff5f' : '#085708',
                            borderWidth: 2,
                            borderRadius: 8,
                        }}>
                            <ThemedText style={{
                                fontSize: 16,
                                fontWeight: 700,
                                textAlign: "center",
                            }}>
                                Crie seu próprio deck
                            </ThemedText>
                        </View>
                    </Pressable>
                </>
            }

            <View
                style={{
                    width: "100%",
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                }}
            >
                <Pressable
                    onPress={() => {
                        prepareCardList()
                    }}
                >
                    <ThemedView style={{
                        height: 40,
                        paddingHorizontal: 16,
                        justifyContent: "center", alignItems: "center",
                        borderRadius: 8, borderWidth: 1
                    }}>

                        <ThemedText>Carregar Arquivo</ThemedText>
                    </ThemedView>
                </Pressable>
                <Pressable
                    onPress={() => {
                        sendToWS({
                            data_type: 'match_data',
                            data_command: 'set_deck',
                            data: {
                                match_id: game.match_id,
                                card_family: card_family,
                                card_list: cardList
                            }
                        })
                        setCardList([])
                        setShowModal(false)
                    }}
                >
                    <ThemedView style={{
                        height: 40,
                        paddingHorizontal: 16,
                        justifyContent: "center", alignItems: "center",
                        borderRadius: 8, borderWidth: 1,
                    }}>
                        {cardList.length === 0
                            ? <ThemedText>Reiniciar Deck</ThemedText>
                            : <ThemedText>Salvar Deck</ThemedText>
                        }
                    </ThemedView>
                </Pressable>
            </View>
        </ThemedModal>
    </>)
}