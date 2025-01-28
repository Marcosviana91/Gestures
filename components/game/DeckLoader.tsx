import { useState } from 'react';
import { View, Pressable, ScrollView, Linking, ToastAndroid, useColorScheme, Image, Text } from 'react-native';

import * as DocumentPicker from 'expo-document-picker';
import { readFile } from "@/utils/FileSystem/Reader";

import { useSelector } from 'react-redux';
import { RootReducer } from '@/store';

import { ThemedText } from '../themed/ThemedText';
import { ThemedView } from '../themed/ThemedView';
import { ThemedModal } from '../themed/ThemedModal';

import { game } from '@/utils/game';
import { getMediaBase64 } from '@/utils/FileSystem/Media';

export default function DeckLoader({ sendToWS, card_family, setShowDeckLoader }: {
    sendToWS: (data: WebSocketData) => void,
    card_family: string,
    setShowDeckLoader: (deck_title: string) => void,
}) {
    const [cardList, setCardList] = useState<string[]>([])
    const [selectedCardSlug, setSelectedCardSlug] = useState('')
    const theme = useColorScheme() // light | dark

    function prepareCardList() {
        function file_content(file_content: deckBuilderFromMateusCosta) {
            // TODO REMOVER ACENTUAÇÃO
            // THANKS https://pt.stackoverflow.com/questions/237762/remover-acentos-javascript
            let _temp_array: string[] = []
            // Verifica se o arquivo  baixado tem outra estrutura, usada nos Decks da Comunidade
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (file_content.cards !== undefined) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                file_content = file_content.cards
            }
            console.log('CARD: #', file_content.length)
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
                if (data.canceled) {
                    console.log("CANCELED: getDocumentAsync")
                    return
                }
                console.log("SELECTED: getDocumentAsync:")
                if (data.output && data.output.length > 0 && data.output[0].type === 'application/json') {
                    console.log("OUTPUT: ", data.output)
                    data.output[0].text()
                        .then(text => { file_content(JSON.parse(text)) })
                } else if (data.assets.length > 0 && data.assets[0].mimeType === 'application/json') {
                    console.log("ASSETS: ", data.assets)
                    readFile(data.assets[0].uri)
                        .then(text => {
                            file_content(JSON.parse(text))
                        })
                }
            })
    }

    return (
        <ThemedModal
            title='Escolha o Deck'
            closeModal={() => {
                setCardList([])
                setShowDeckLoader('')
            }}
            dismissable
            backgroundTransparent
        >
            {cardList.length > 0
                ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center', justifyContent: 'center', maxHeight: '80%' }}>
                    <ThemedText>{`${cardList.length} Cartas Carregadas`}</ThemedText>
                    <ScrollView
                        contentContainerStyle={{
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            justifyContent: "space-evenly",
                            rowGap: 8,
                        }}
                    >
                        {cardList.map((card, _index) => (
                            <PreloadedCard
                                key={_index}
                                card_slug={card}
                                selectedCardSlug={selectedCardSlug}
                                setSelectedCardSlug={setSelectedCardSlug}
                            />
                        ))}
                    </ScrollView>
                </View>
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                : <>
                    <ThemedText>{`Escolha o Deck para as cartas: ${card_family}`}</ThemedText>
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
    )
}

function PreloadedCard({ card_slug, selectedCardSlug, setSelectedCardSlug }: {
    card_slug: string,
    selectedCardSlug: string,
    setSelectedCardSlug: (card_slug: string) => void
}) {
    const appData = useSelector((state: RootReducer) => state.appReducer.data)
    const [media64, setMedia64] = useState("")
    appData.selected_game_details?.deckType.forEach(
        deck => deck.cards.forEach(
            card => {
                if (card_slug === card.card_slug) {
                    getMediaBase64(card.card_image_mini).then(text64 => setMedia64(text64))
                }
            }
        )
    )

    return (
        <Pressable
            onPress={() => {
                if (selectedCardSlug === card_slug) {
                    setSelectedCardSlug('')
                } else {
                    setSelectedCardSlug(card_slug)
                }
            }}
        >
            {media64 &&
                <Image
                    style={{
                        height: selectedCardSlug === card_slug ? 200 : 50,
                        width: selectedCardSlug === card_slug ? 144 : 36,
                        borderRadius: 8, borderColor: '#555', borderWidth: 2
                    }}
                    source={{
                        uri: media64
                    }}
                />
            }
        </Pressable>
    )
}