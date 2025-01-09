import { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Platform, ScrollView } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { useSelector } from 'react-redux'
import { RootReducer } from '@/store';
import { useGetUserDataQuery } from '@/store/api'

import { BOARD_POSITIONS } from '@/constants/Positions';

import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import Card, { DeckCard, MiniCard } from '@/components/game/Card';
import PlayerAvatar64 from "@/components/PlayerAvatar64";
import { ThemedModal } from '@/components/themed/ThemedModal';
import { ThemedText } from '@/components/themed/ThemedText';
import { ThemedView } from '@/components/themed/ThemedView';

import { game } from '@/utils/game';
import { getMediaBase64 } from '@/utils/FileSystem/Media';

type BoardProps = {
    enemy?: boolean;
    player_id: number;
    sendToWS: (data: WebSocketData) => void
}

export default function Board(props: BoardProps) {
    // console.log(`Renderizou ${props.enemy ? 'enemy ' : ''}Board`);
    const appData = useSelector((state: RootReducer) => state.appReducer.data)
    const [showAllCardsInDeck, setShowAllCardsInDeck] = useState('');
    const [showFaithControls, setShowFaithControls] = useState(false);
    const [faithPointsControl, setFaithPointsControl] = useState(0);
    const { data: playerData } = useGetUserDataQuery(props.player_id)

    const [openedMenuId, setOpenedMenuId] = useState('');

    // Image
    const [base64_board_string, setBase64_board_string] = useState('')
    
    // Set Playmat Image
    useEffect(() => {
        if (Platform.OS === 'android' && appData.selected_game_details?.gameBoard) {
            getMediaBase64(appData.selected_game_details?.gameBoard[appData.game.board_id].image).then(file => setBase64_board_string(file))
        }
    }, [appData.game.board_id])


    const player_data = game.getPlayerData(props.player_id)
    var card_game = player_data?.cards_in_game
    // console.log("game", game)


    const style = StyleSheet.create({
        image: {
            width: "100%",
            height: "100%",
            resizeMode: "stretch",
        }
    })


    const changeLifeGesture = Gesture.Pan()
        .onStart(() => {
            if (!props.enemy) {
                setShowFaithControls(true)
            }
        })
        .onUpdate((event) => {
            if (!props.enemy) {
                setFaithPointsControl(Math.ceil(-1 * event.translationY / 30))
            }
        })
        .onEnd(() => {
            if (!props.enemy) {
                setShowFaithControls(false)
                if (faithPointsControl !== 0) {
                    props.sendToWS({
                        data_type: 'match_data',
                        data_command: 'change_faith_points',
                        data: {
                            match_id: game.match_id,
                            faith_points: faithPointsControl,
                        }

                    })
                }
            }
            setFaithPointsControl(0)
        })
        .runOnJS(true);

    return (
        <View>
            {/* Playmat */}
            <View style={{
                position: 'absolute',
                bottom: BOARD_POSITIONS.Playmat.bottom,
                width: BOARD_POSITIONS.Playmat.width,
                height: BOARD_POSITIONS.Playmat.height,
            }}>

                {/* Player ID */}
                <ThemedView
                    style={{
                        position: 'absolute',
                        top: -30,
                        left: -27,
                        height: 30,
                        paddingHorizontal: 8,
                        zIndex: 1,
                    }}>
                    <ThemedText>
                        {playerData?.username}
                    </ThemedText>
                    {playerData && <PlayerAvatar64 size={50} file_name={playerData.avatar} />}
                </ThemedView>

                {/* Change Faith Points */}
                <View style={{
                    position: 'absolute',
                    top: -30,
                    right: 0,
                    height: 30,
                    zIndex: 999
                }}>
                    {showFaithControls && <>
                        <View style={{ position: 'absolute', top: -40, opacity: faithPointsControl < 0 ? 0.4 : 1 }}>
                            <FontAwesome5 name="plus-circle" size={36} color="#0f0" />
                        </View>
                        <View style={{ position: 'absolute', right: 80 }}>
                            <ThemedText type='subtitle'>{faithPointsControl}</ThemedText>
                        </View>
                        <View style={{ position: 'absolute', bottom: -40, opacity: faithPointsControl > 0 ? 0.4 : 1 }}>
                            <FontAwesome5 name="minus-circle" size={36} color="#f00" />
                        </View>
                    </>
                    }
                    <GestureDetector gesture={changeLifeGesture}>
                        <ThemedView style={{ padding: 2 }} >
                            <ThemedText style={{ fontSize: 24 }}>
                                <MaterialCommunityIcons name="shield-cross" size={24} />
                                {player_data?.faith_points}
                            </ThemedText>
                        </ThemedView>
                    </GestureDetector>
                </View>

                {base64_board_string &&
                    <Image
                        style={[style.image]}
                        source={{
                            uri: base64_board_string
                        }}
                    />
                }
            </View>

            {/* DECKs */}
            {!props.enemy && <>
                {appData.selected_game_details?.deckType.map((_, index) => {
                    return (
                        <DeckCard
                            key={index}
                            deck_index={index}
                            setShowAllCards={setShowAllCardsInDeck}
                            sendToWS={props.sendToWS}
                            menuId={openedMenuId}
                            setMenuId={setOpenedMenuId}
                        />
                    )
                })}
            </>
            }

            {/* MÃO */}
            {/* <View style={{
                backgroundColor: '#afa0',
                position: 'absolute',
                bottom: BOARD_POSITIONS.MAO.bottom,
                width: BOARD_POSITIONS.MAO.width,
                height: BOARD_POSITIONS.MAO.height
            }} /> */}
            {/* Cartas */}
            <View style={{ zIndex: 999 }}>
                {card_game && card_game.map((card) => {
                    if (card.where_i_am == 'attached') {
                        return undefined
                    }
                    return (
                        <Card
                            key={card.in_game_id}
                            card_id={card.in_game_id}
                            sendToWS={props.sendToWS}
                            menuId={openedMenuId}
                            setMenuId={setOpenedMenuId}
                        />
                    )
                })}
            </View>
            {/* Cartas do Deck */}
            {showAllCardsInDeck !== '' &&
                <ThemedModal
                    closeModal={() => { setShowAllCardsInDeck('') }}
                    title={showAllCardsInDeck.toUpperCase()}
                    backgroundTransparent
                    dismissable
                >
                    <ThemedText>Clique para comprar uma carta</ThemedText>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center', justifyContent: 'center', maxHeight: '80%' }}>
                        <ScrollView
                            contentContainerStyle={{
                                flexDirection: 'row',
                                flexWrap: 'wrap',
                                justifyContent: "center",
                                gap: 8,
                                padding: 8,
                            }}>
                            {player_data?.cards_deck.map((card, _index) => {
                                if (card.card_family.toLowerCase() !== showAllCardsInDeck) {
                                    return undefined
                                }
                                return (
                                    <MiniCard
                                        key={_index}
                                        card={card}
                                        sendToWS={(data) => {
                                            props.sendToWS(data)
                                            setShowAllCardsInDeck('')
                                        }}
                                    />
                                )
                            })}
                        </ScrollView>
                    </View>
                </ThemedModal>}
        </View>
    )
}