import { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Pressable } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { useSelector } from 'react-redux'
import { RootReducer } from '@/store';

import { BOARD_POSITIONS } from '@/constants/Positions';

import Card, { DeckCard, WisdomCard } from '@/components/Card';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { game } from '@/utils/game';
import { ThemedModal } from './themed/ThemedModal';
import { ThemedText } from './themed/ThemedText';
import { ThemedView } from './themed/ThemedView';

type BoardProps = {
    enemy?: boolean;
    player_name: string;
    // cards: CardProps[]
    sendToWS: (data: { data_type: string, match?: string, player: string, card?: CardProps, increment?: boolean, faith_points?: number }) => void
}

export default function Board(props: BoardProps) {
    // console.log(`Renderizou ${props.enemy ? 'enemy ' : ''}Board`);
    const fakeUserData = useSelector((state: RootReducer) => state.fakeAuthReducer.data)
    const [availableWisdom, setAvailableWisdom] = useState<any[]>([])
    const [showCardMenu, setShowCardMenu] = useState(false);
    const [showAllDeck, setShowAllDeck] = useState(false);
    const [showFaithControls, setShowFaithControls] = useState(false);
    const [faithPointsControl, setFaithPointsControl] = useState(0);
    const [cardDeck, setCardDeck] = useState<CardProps[]>([])

    const player_data = game.getPlayerData(props.player_name)
    var card_game = player_data?.card_hand

    useEffect(() => {
        if (player_data && player_data.total_wisdom_points) {
            let __temp_array = []
            for (let i = 0; i < player_data!.total_wisdom_points - player_data.available_wisdom_points; i++) {
                __temp_array.push(<WisdomCard key={i} wisdom_id={`wisdom_card_${i}`} show={true} enemy={props.enemy} sendToWS={toggleWisdom} />)
            }
            for (let i = player_data!.total_wisdom_points - player_data.available_wisdom_points; i < player_data!.total_wisdom_points; i++) {
                __temp_array.push(<WisdomCard key={i} wisdom_id={`wisdom_card_${i}`} show={false} enemy={props.enemy} sendToWS={toggleWisdom} />)
            }
            setAvailableWisdom(__temp_array)
        }
    }, [player_data?.available_wisdom_points, player_data?.total_wisdom_points])

    const style = StyleSheet.create({
        image: {
            width: "100%",
            height: "100%",
            resizeMode: "stretch",
        }
    })

    const showCardMenuGesture = Gesture.LongPress()
        .onStart(() => {
            console.log("SHOW DECK MENU")
            setShowCardMenu(!showCardMenu)
        }).runOnJS(true);

    const giveCardTap = Gesture.Tap()
        .numberOfTaps(2)
        .onStart(() => {
            props.sendToWS({
                data_type: 'give_card',
                match: fakeUserData.match,
                player: fakeUserData.name,
            })
            setShowCardMenu(false)
        }).runOnJS(true);

    const giveWisdomPress = Gesture.LongPress()
        .onStart(() => {
            if (availableWisdom.length <= 9) {
                props.sendToWS({
                    data_type: 'give_wisdom',
                    match: fakeUserData.match,
                    player: fakeUserData.name,
                })
            }
        }).runOnJS(true);

    const takeWisdomTap = Gesture.Tap()
        .numberOfTaps(2)
        .onStart(() => {
            if (availableWisdom.length > 0) {
                props.sendToWS({
                    data_type: 'take_wisdom',
                    match: fakeUserData.match,
                    player: fakeUserData.name,
                })
            }
        }).runOnJS(true);

    const changeFaithGesture = Gesture.Pan()
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
                        data_type: 'change_faith_points',
                        match: fakeUserData.match,
                        player: fakeUserData.name,
                        faith_points: faithPointsControl,
                    })
                }
            }
        })
        .runOnJS(true);

    function sendMoveToServer(card: CardProps) {
        console.log("sendMoveToServer", card)
        if (card.where_i_am === 'playmat' || card.where_i_am === 'hand') {
            props.sendToWS({
                data_type: 'card_move',
                match: fakeUserData.match,
                player: fakeUserData.name,
                card: card
            })
        } else if (card.where_i_am === 'deck') {
            props.sendToWS({
                data_type: 'back_to_deck',
                match: fakeUserData.match,
                player: fakeUserData.name,
                card: card
            })
        }
    }
    function getCardFromServer(card: CardProps) {
        setShowAllDeck(false)
        props.sendToWS({
            data_type: 'get_card',
            match: fakeUserData.match,
            player: fakeUserData.name,
            card: card
        })
    }
    function shuffleCards() {
        setShowAllDeck(false)
        props.sendToWS({
            data_type: 'shuffle_card',
            match: fakeUserData.match,
            player: fakeUserData.name,
        })
    }
    function toggleWisdom(increment: boolean) {
        if (increment) {
            console.log("Esconder")
            console.log("+1 disponível")
        } else {
            console.log("Mostrar")
            console.log("-1 disponível")
        }
        props.sendToWS({
            data_type: 'toggle_wisdom',
            match: fakeUserData.match,
            player: fakeUserData.name,
            increment: increment,
        })
    }

    return (
        <View>
            <View style={{ position: 'absolute', bottom: 350, left: 480, padding: 8, alignItems: 'center', gap: 8, zIndex: 999 }}>
                {showFaithControls && <View style={{ position: 'absolute', top: -40, opacity: faithPointsControl < 0 ? 0.4 : 1 }}>
                    <FontAwesome5 name="plus-circle" size={36} color="#0f0" />
                </View>}
                {showFaithControls && <View style={{ position: 'absolute', right: 80 }}>
                    <ThemedText type='subtitle'>{faithPointsControl}</ThemedText>
                </View>}
                <GestureDetector gesture={changeFaithGesture}>
                    <ThemedView >
                        <ThemedText>
                            <MaterialCommunityIcons name="shield-cross" size={24} />
                            {player_data?.faith_points}
                        </ThemedText>
                    </ThemedView>
                </GestureDetector>
                {showFaithControls && <View style={{ position: 'absolute', bottom: -40, opacity: faithPointsControl > 0 ? 0.4 : 1 }}>
                    <FontAwesome5 name="minus-circle" size={36} color="#f00" />
                </View>}
            </View>
            {/* MÃO */}
            <View style={{
                // backgroundColor: '#afa',
                position: 'absolute',
                bottom: BOARD_POSITIONS.MAO.bottom,
                width: BOARD_POSITIONS.MAO.width,
                height: BOARD_POSITIONS.MAO.height
            }} />
            {/* CARDS DECK */}
            {!props.enemy &&
                <GestureDetector gesture={showCardMenuGesture}>
                    <GestureDetector gesture={giveCardTap}>
                        <View style={{
                            backgroundColor: '#afa',
                            position: 'absolute',
                            bottom: BOARD_POSITIONS.DK.bottom,
                            left: BOARD_POSITIONS.DK.left,
                            width: BOARD_POSITIONS.DK.width,
                            height: BOARD_POSITIONS.DK.height,
                            zIndex: 1
                        }}>
                            {showCardMenu &&
                                <View style={{ position: 'absolute', top: -36, flex: 1, flexDirection: 'row', columnGap: 8, alignItems: 'center', justifyContent: 'center' }}>
                                    {/* Botão para embaralhar as cartas */}
                                    <Pressable
                                        onPress={() => {
                                            console.log("MISTURAR CARTAS")
                                            shuffleCards()
                                            setShowCardMenu(false)
                                        }}
                                    >
                                        <FontAwesome6 name="shuffle" size={36} color="black" />
                                    </Pressable>
                                    {/* Botão para exibir cartas do deck (vem em ordem alfabética do servidor) */}
                                    <Pressable
                                        onPress={() => {
                                            console.log("VER CARTAS")
                                            const cards = player_data?.card_deck.map(card => card)
                                            setCardDeck(cards!)
                                            setShowCardMenu(false)
                                            setShowAllDeck(true)
                                        }}
                                    >
                                        <Ionicons name="eye" size={36} color="black" />
                                    </Pressable>
                                </View>
                            }
                            <Image
                                style={[style.image]}
                                source={require('@/assets/images/cards_mini/carta_verso.png')}
                            />
                        </View>
                    </GestureDetector>
                </GestureDetector>
            }
            {/* WISDOM DECK */}
            {!props.enemy &&
                <GestureDetector gesture={takeWisdomTap}>
                    <GestureDetector gesture={giveWisdomPress}>
                        <View style={{
                            backgroundColor: '#afa',
                            position: 'absolute',
                            bottom: BOARD_POSITIONS.DW.bottom,
                            left: BOARD_POSITIONS.DW.left,
                            width: BOARD_POSITIONS.DW.width,
                            height: BOARD_POSITIONS.DW.height,
                            zIndex: 1
                        }}>
                            <Image
                                style={[style.image]}
                                source={require('@/assets/images/cards_mini/sabedoria_verso.png')}
                            />
                        </View>
                    </GestureDetector>
                </GestureDetector>
            }
            {/* Playmat */}
            <View style={{
                position: 'absolute',
                bottom: BOARD_POSITIONS.Playmat.bottom,
                width: BOARD_POSITIONS.Playmat.width,
                height: BOARD_POSITIONS.Playmat.height,
            }}>
                <Image
                    style={[style.image]}
                    source={require('@/assets/images/boards/faith_battle_alpha_gelo.jpg')}
                />
            </View>
            {/* Wisdom */}
            <View style={{ zIndex: 990, position: 'absolute', bottom: 115, left: 8, height: 60 }}>
                {availableWisdom.map(element => element)}

            </View>
            {/* Cartas */}
            <View style={{ zIndex: 999 }}>
                {card_game && card_game.map((card, _index) => {
                    return (
                        <Card
                            key={card.in_game_id}
                            card_id={card.in_game_id}
                            sendToWS={sendMoveToServer}
                        />
                    )
                })}
            </View>
            {/* Cartas do Deck */}
            {showAllDeck && <ThemedModal
                closeModal={() => { setShowAllDeck(false) }}
                title='Cartas do Deck'
                backgroundTransparent
            >
                <ThemedText>Clique para comprar a carta</ThemedText>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
                    {cardDeck.map((card) => {
                        return (
                            <DeckCard
                                key={card.in_game_id}
                                card={card}
                                sendToWS={getCardFromServer}
                            />
                        )
                    })}
                </View>
            </ThemedModal>}

        </View>
    )
}