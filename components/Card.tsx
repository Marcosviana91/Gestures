import { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, ScrollView } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { useSelector } from 'react-redux';
import { RootReducer } from '@/store';

import { BOARD_POSITIONS } from '@/constants/Positions';
import { BOARD_WIDTH, CARD_HEIGHT, CARD_PADDING_X, CARD_WIDTH } from '@/constants/Sizes';

import { getCardImage, getCardImageMini } from '@/hooks/useCards';
import { game } from '@/utils/game';
import { ThemedModal } from './themed/ThemedModal';
import { ThemedView } from './themed/ThemedView';
import { ThemedText } from './themed/ThemedText';

import AntDesign from '@expo/vector-icons/AntDesign';

type Props = {
    card_id: string,
    sendToWS: (data: { data_type: string, card?: CardProps, change_points?: number }) => void
}

export default function Card({ card_id, sendToWS }: Props) {
    // console.log('Renderizou  card')
    const fakeUserData = useSelector((state: RootReducer) => state.fakeAuthReducer.data)
    const player_card_id = card_id.split('_')[0]
    const player_data = game.getPlayerData(player_card_id)
    const card_game = [...player_data?.cards_in_game!]
    const card = card_game!.find(card => card.in_game_id === card_id)
    const card_is_mine = fakeUserData.name === card?.in_game_id.split('_')[0]
    const is_hidden = (player_card_id !== fakeUserData.name && card?.where_i_am === 'hand');
    const [isCollided, setIsCollided] = useState(false)
    const [showAttachedCardDescription, setShowAttachedCardDescription] = useState(false)
    const [selectedInnerCard, setSelectedInnerCard] = useState<CardProps>()

    // Card Params Values and Controls
    const [showTopLeftValueControls, setShowTopLeftValueControls] = useState(false);
    const [topLeftValue, setTopLeftValue] = useState(0);
    const [showTopRightValueControls, setShowTopRightValueControls] = useState(false);
    const [topRightValue, setTopRightValue] = useState(0);
    const [showBottomLeftValueControls, setShowBottomLeftValueControls] = useState(false);
    const [bottomLeftValue, setBottomLeftValue] = useState(0);
    const [showBottomRightValueControls, setShowBottomRightValueControls] = useState(false);
    const [bottomRightValue, setBottomRightValue] = useState(0);

    // cópia manipulável do card
    var _card: CardProps = { ...card! }

    const cardBottom = useSharedValue(_card.position.bottom ? _card.position.bottom : 0);
    const cardLeft = useSharedValue(_card.position.left ? _card.position.left : 0);
    const zIndex = useSharedValue(0);

    // TODO Renderizar as cartas individualmente


    const [bigger, setBigger] = useState(false)


    // Movimenta a carta automaticamente
    useEffect(() => {
        if (card?.position) {
            cardLeft.value = withTiming(_card.position.left)
            cardBottom.value = withTiming(_card.position.bottom)
        }
    }, [card])

    function updateCardProps() {
        checkYposition()
        checkXposition()
        checkCollision(cardLeft.value, cardBottom.value, true)
        console.log("updateCardProps", _card)
        game.setCardsOrder({ ..._card })
        if (_card.where_i_am === 'playmat' || _card.where_i_am === 'hand') {
            sendToWS({
                data_type: 'card_move',
                card: _card
            })
        } else if (_card.where_i_am === 'deck') {
            sendToWS({
                data_type: 'back_to_deck',
                card: _card
            })
        }
    }

    function checkYposition() {
        // Checa a posição VERTICAL que a carta foi solta e defina sua nova posição de acordo com a zona
        switch (_card?.where_i_am) {
            case 'hand':
                if (cardBottom.value > BOARD_POSITIONS.MAO.height) {
                    _card = { ..._card, where_i_am: 'playmat' }
                }
                break
            case 'playmat':
                if (cardBottom.value <= BOARD_POSITIONS.MAO.height) {
                    _card = { ..._card, where_i_am: 'hand' }
                }
                break
        }
        _card = {
            ..._card, position: {
                bottom: cardBottom.value,
                left: _card.position.left
            }
        }
    }

    function checkXposition() {
        _card.position.left = cardLeft.value
        // Checa se a carta foi movida HORIZONTALMENTE para fora da tela
        // if (cardLeft.value < (CARD_PADDING_X)) {
        //     cardLeft.value = withTiming(CARD_PADDING_X)
        //     _card.position!.left = CARD_PADDING_X
        // }
        // else if (cardLeft.value + imageWidth.value >= BOARD_WIDTH) {
        //     cardLeft.value = withTiming((BOARD_WIDTH - imageWidth.value) - (CARD_PADDING_X / 2))
        //     _card.position!.left = (BOARD_WIDTH - imageWidth.value) - (CARD_PADDING_X / 2)
        // }
    }

    function checkCollision(left: number, bottom: number, endMove: boolean) {
        // Checar colisão com o deck
        if (
            (left > BOARD_POSITIONS.DK.left - (CARD_WIDTH / 2)) &&
            (left < BOARD_POSITIONS.DK.left + (CARD_WIDTH / 2)) &&
            (bottom > BOARD_POSITIONS.DK.bottom - (CARD_HEIGHT / 2)) &&
            (bottom < BOARD_POSITIONS.DK.bottom + (CARD_HEIGHT / 2))
        ) {
            if (endMove) {
                setIsCollided(false)
                _card = { ..._card, where_i_am: "deck" }
                // sendToWS({..._card, where_i_am: "deck"})
            }
            else {
                setIsCollided(true)
            }
        }
        else {
            setIsCollided(false)
        }
        if (_card.where_i_am === 'playmat') {
            card_game.forEach(card_to_check => {
                if (card_to_check.where_i_am === 'playmat' && card_to_check.in_game_id != _card.in_game_id) {
                    if (
                        (left > card_to_check.position.left - (CARD_WIDTH / 2)) &&
                        (left < card_to_check.position.left + (CARD_WIDTH / 2)) &&
                        (bottom > card_to_check.position.bottom - (CARD_HEIGHT / 2)) &&
                        (bottom < card_to_check.position.bottom + (CARD_HEIGHT / 2))
                    ) {
                        setIsCollided(true)
                        if (endMove) {
                            setIsCollided(false)
                            _card = { ..._card, where_i_am: "attached" }
                            console.log(`Acoplar a carta ${_card.in_game_id} na carta ${card_to_check.in_game_id} `)
                            // card_to_check.attached_cards.push(_card)
                            // const _card_target: CardProps = { ..._card, attached_cards: [] }
                            card_to_check.attached_cards = [...card_to_check.attached_cards, _card]
                            console.log(card_to_check)
                            sendToWS({
                                data_type: 'attach_card',
                                card: { ...card_to_check }
                            })
                        }
                    }
                }
            })
        }
    }

    // TODO: Mudar para abrir modal onde será possível alterar os atributos da carta
    const tapCard = Gesture.Tap()
        .numberOfTaps(1)
        .onStart(() => {
            if (!is_hidden) {
                setBigger(!bigger)

            }
        })
        .runOnJS(true)

    const drag = Gesture.Pan()
        .minDistance(5)
        .onStart(() => {
            if (card_is_mine) {
                zIndex.value = 999
            }
        })
        .onChange((event) => {
            if (card_is_mine) {
                cardBottom.value -= event.changeY;
                cardLeft.value += event.changeX;
                checkCollision(cardLeft.value, cardBottom.value, false)
            }
        })
        .onEnd(() => {
            if (card_is_mine) {
                zIndex.value = withDelay(100, withTiming(0))
                updateCardProps()
            }
            // console.log('Bottom: ', cardBottom.value)
            // console.log('Left: ', cardLeft.value)
        })
        .runOnJS(true)

    const changeTopLeftValue = Gesture.Pan()
        .minDistance(0)
        .onStart(() => {
            if (card_is_mine) {
                console.log("changeTopLeftValue")
                setShowTopLeftValueControls(true)
            }
        })
        .onChange((event) => {
            if (card_is_mine) {
                setTopLeftValue(Math.ceil(-1 * event.translationY / 50))
            }
        })
        .onEnd(() => {
            if (card_is_mine) {
                setShowTopLeftValueControls(false)
                if (topLeftValue !== 0) {
                    sendToWS({
                        data_type: 'change_top_left_value',
                        change_points: topLeftValue,
                    })
                }
            }
        })
        .runOnJS(true)

    const changeTopRightValue = Gesture.Pan()
        .minDistance(0)
        .onStart(() => {
            if (card_is_mine) {
                setShowTopRightValueControls(true)
            }
        })
        .onChange((event) => {
            if (card_is_mine) {
                setTopRightValue(Math.ceil(-1 * event.translationY / 50))
            }
        })
        .onEnd(() => {
            if (card_is_mine) {
                setShowTopRightValueControls(false)
                if (topRightValue !== 0) {
                    sendToWS({
                        data_type: 'change_top_right_value',
                        change_points: topRightValue,
                    })
                }
            }
        })
        .runOnJS(true)

    const changeBottomLeftValue = Gesture.Pan()
        .minDistance(0)
        .onStart(() => {
            if (card_is_mine) {
                setShowBottomLeftValueControls(true)
            }
        })
        .onChange((event) => {
            if (card_is_mine) {
                setBottomLeftValue(Math.ceil(-1 * event.translationY / 50))
            }
        })
        .onEnd(() => {
            if (card_is_mine) {
                setShowBottomLeftValueControls(false)
                if (bottomLeftValue !== 0) {
                    sendToWS({
                        data_type: 'change_bottom_left_value',
                        change_points: bottomLeftValue,
                    })
                }
            }
        })
        .runOnJS(true)

    const changeBottomRightValue = Gesture.Pan()
        .minDistance(0)
        .onStart(() => {
            if (card_is_mine) {
                setShowBottomRightValueControls(true)
            }
        })
        .onChange((event) => {
            if (card_is_mine) {
                setBottomRightValue(Math.ceil(-1 * event.translationY / 50))
            }
        })
        .onEnd(() => {
            if (card_is_mine) {
                setShowBottomRightValueControls(false)
                if (bottomRightValue !== 0) {
                    sendToWS({
                        data_type: 'change_top_left_value',
                        change_points: bottomRightValue,
                    })
                }
            }
        })
        .runOnJS(true)

    const imageStyle = useAnimatedStyle(() => {
        return {
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            // borderColor: withTiming(isSelected ? '#ff0f' : '#fff0'),
            borderRadius: 4,
            borderWidth: 2,
        };
    });

    const containerStyle = useAnimatedStyle(() => {
        return {
            position: 'absolute',
            bottom: cardBottom.value,
            left: cardLeft.value,
            zIndex: _card.where_i_am === 'deck' ? -1 : zIndex.value,
            transform: [
                {
                    scale: withTiming(isCollided ? 0.8 : 1, { duration: 200 })
                },
            ]
        };
    });

    if (bigger) {
        return (
            <>
                <GestureDetector gesture={tapCard}>
                    <ThemedView style={{ width: 550, height: 500, position: 'absolute', top: -850, zIndex: 9999, justifyContent: 'center', alignItems: 'center', borderRadius: 16 }}>
                        <View style={{ width: CARD_WIDTH * 6, alignItems: 'center', justifyContent: 'flex-end', rowGap: 8 }}>
                            <Image source={
                                getCardImage({ card_slug: _card.slug! })
                            }
                                resizeMode="contain"
                                style={{ height: CARD_HEIGHT * 6 }}
                            />
                            {/* Atributos da carta */}
                            {/* top_left_value */}
                            {typeof (card?.top_left_value) == 'number' &&
                                <GestureDetector gesture={changeTopLeftValue} >
                                    <View style={{
                                        backgroundColor: '#000000b2',
                                        position: 'absolute', top: 8, left: 8,
                                        width: 32, height: 48, borderRadius: 8,
                                        zIndex: 999
                                    }}>
                                        {showTopLeftValueControls &&
                                            <>
                                                <AntDesign name="caretup" size={32} color="black" style={{ position: 'absolute', top: -20, color: '#0f0', opacity: topLeftValue > 0 ? 1 : .5 }} />
                                                <ThemedText style={{ position: 'absolute', left: -30, fontSize: 32, lineHeight: 40 }}>{topLeftValue}</ThemedText>
                                                <AntDesign name="caretdown" size={32} color="black" style={{ position: 'absolute', bottom: -20, color: '#f00', opacity: topLeftValue < 0 ? 1 : .5 }} />
                                            </>
                                        }
                                        <Text style={{
                                            textAlign: 'center', fontWeight: '900', fontSize: 32, lineHeight: 40,
                                            color: 'white',
                                        }}>{card?.top_left_value}</Text>

                                    </View>
                                </GestureDetector>
                            }
                            {/* top_right_value */}
                            {typeof (card?.top_right_value) == 'number' &&
                                <GestureDetector gesture={changeTopRightValue} >
                                    <View style={{
                                        backgroundColor: '#000000b2',
                                        position: 'absolute', top: 8, right: 8,
                                        width: 32, height: 48, borderRadius: 8,
                                    }}>
                                        {showTopRightValueControls &&
                                            <>
                                                <ThemedText style={{ position: 'absolute', right: -30, fontSize: 32, lineHeight: 40 }}>{topRightValue}</ThemedText>
                                                <AntDesign name="caretup" size={32} color="black" style={{ position: 'absolute', top: -20, color: '#0f0' }} />
                                                <AntDesign name="caretdown" size={32} color="black" style={{ position: 'absolute', bottom: -20, color: '#f00' }} />
                                            </>
                                        }
                                        <Text style={{
                                            width: 32, borderRadius: 8,
                                            textAlign: 'center', fontWeight: '900', fontSize: 32, lineHeight: 40,
                                            color: 'white'
                                        }}>{card?.top_right_value}</Text>
                                    </View>
                                </GestureDetector>
                            }
                            {/* bottom_left_value */}
                            {typeof (card?.bottom_left_value) == 'number' &&
                                <GestureDetector gesture={changeBottomLeftValue} >
                                    <View style={{
                                        backgroundColor: '#000000b2',
                                        position: 'absolute', top: (CARD_HEIGHT * 6) - 54, left: 8,
                                        width: 32, height: 48, borderRadius: 8,
                                    }}>
                                        {showBottomLeftValueControls &&
                                            <>
                                                <AntDesign name="caretup" size={32} color="black" style={{ position: 'absolute', top: -20, color: '#0f0' }} />
                                                <ThemedText style={{ position: 'absolute', left: -30, fontSize: 32, lineHeight: 40 }}>{bottomLeftValue}</ThemedText>
                                                <AntDesign name="caretdown" size={32} color="black" style={{ position: 'absolute', bottom: -20, color: '#f00' }} />
                                            </>
                                        }
                                        <Text style={{
                                            textAlign: 'center', fontWeight: '900', fontSize: 32, lineHeight: 40,
                                            color: 'white'
                                        }}>{card?.bottom_left_value}</Text>
                                    </View>
                                </GestureDetector>
                            }
                            {/* bottom_right_value */}
                            {typeof (card?.bottom_right_value) == 'number' &&
                                <GestureDetector gesture={changeBottomRightValue} >
                                    <View style={{
                                        backgroundColor: '#000000b2',
                                        position: 'absolute', top: (CARD_HEIGHT * 6) - 54, right: 8,
                                        width: 32, height: 48, borderRadius: 8,
                                    }}>
                                        {showBottomRightValueControls &&
                                            <>
                                                <ThemedText style={{ position: 'absolute', right: -30, fontSize: 32, lineHeight: 40 }}>{bottomRightValue}</ThemedText>
                                                <AntDesign name="caretup" size={32} color="black" style={{ position: 'absolute', top: -20, color: '#0f0' }} />
                                                <AntDesign name="caretdown" size={32} color="black" style={{ position: 'absolute', bottom: -20, color: '#f00' }} />
                                            </>
                                        }
                                        <Text style={{
                                            textAlign: 'center', fontWeight: '900', fontSize: 32, lineHeight: 40,
                                            color: 'white'
                                        }}>{card?.bottom_right_value}</Text>
                                    </View>
                                </GestureDetector>
                            }
                            {/* Attached Cards */}

                        </View>
                    </ThemedView>
                </GestureDetector>
                {_card.attached_cards.length > 0 &&
                    <ThemedView style={{ width: 550, height: 200, position: 'absolute', top: -340, zIndex: 9999, justifyContent: 'center', alignItems: 'center', borderRadius: 16 }}>
                        <View style={{ width: '90%', height: CARD_HEIGHT + 17, paddingVertical: 8, alignItems: 'center', borderColor: '#6e6e6e', borderWidth: 1, borderRadius: 8 }}>
                            <ScrollView horizontal >
                                {_card.attached_cards.map(attached_card => (
                                    <Pressable
                                        key={attached_card.in_game_id}
                                        onPress={() => {
                                            setShowAttachedCardDescription(!showAttachedCardDescription)
                                            setSelectedInnerCard(attached_card)
                                        }}
                                    >
                                        <Image key={attached_card.in_game_id} source={
                                            getCardImageMini({ card_slug: attached_card.slug! })
                                        }
                                            resizeMode="contain"
                                            style={{ maxHeight: CARD_HEIGHT }}
                                        />
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>
                        {/* Descrição do artefato */}
                        {showAttachedCardDescription &&
                            <Pressable
                                style={{ position: 'absolute', top: -CARD_HEIGHT * 3, zIndex: 999, }}
                                onPress={() => {
                                    setShowAttachedCardDescription(false)
                                }}
                            >
                                <ThemedView style={{ width: CARD_WIDTH * 8, height: 200, borderRadius: 8, borderWidth: 1, padding: 8, alignItems: 'center', justifyContent: 'space-between' }}>
                                    <ThemedText type='subtitle'>{selectedInnerCard?.slug.replaceAll('-', ' ').toUpperCase()}</ThemedText>
                                    <ThemedText>
                                        {/* TODO: Pegar descrição da carta */}
                                        Pegar descrição da carta
                                    </ThemedText>
                                    {player_card_id == fakeUserData.name &&
                                        <Pressable
                                            style={{ borderWidth: 1, borderColor: '#575757', borderRadius: 8, padding: 8 }}
                                            onPress={() => {
                                                console.log("Remover ", selectedInnerCard?.in_game_id, 'de', _card.in_game_id)
                                                if (selectedInnerCard) {
                                                    sendToWS({
                                                        data_type: 'dettach_card',
                                                        card: {
                                                            ..._card,
                                                            attached_cards: [selectedInnerCard!]
                                                        }
                                                    })
                                                }
                                                setShowAttachedCardDescription(false)
                                                setBigger(false)
                                            }}
                                        >
                                            <ThemedText>Remover Carta</ThemedText>
                                        </Pressable>
                                    }
                                </ThemedView>

                            </Pressable>
                        }
                    </ThemedView>
                }
            </>
        )
    }
    return (
        <>
            <GestureDetector gesture={tapCard}>
                <Animated.View style={[containerStyle]}>
                    <GestureDetector gesture={drag}>
                        <Animated.View>
                            {(bigger || false) &&
                                <Animated.Text>{_card.where_i_am}</Animated.Text>
                            }
                            <View>
                                <Animated.Image
                                    source={
                                        is_hidden ?
                                            getCardImageMini({ card_slug: 'card-back' }) :
                                            getCardImageMini({ card_slug: _card.slug! })
                                    }
                                    resizeMode="contain"
                                    style={imageStyle}
                                />
                                {!is_hidden &&
                                    <>
                                        <View style={{ position: 'absolute', flexDirection: 'row', width: '100%', height: 16 }}>
                                            <Text style={{ backgroundColor: '#0000005c', width: '50%', paddingLeft: 4, textAlign: 'left', fontWeight: '900', lineHeight: 16, color: 'white' }}>{card?.top_left_value}</Text>
                                            <Text style={{ backgroundColor: '#0000005c', width: '50%', paddingRight: 4, textAlign: 'right', fontWeight: '900', lineHeight: 16, color: 'white' }}>{card?.top_right_value}</Text>
                                        </View>
                                        <View style={{ position: 'absolute', bottom: 0, flexDirection: 'row', width: '100%', height: 16 }}>
                                            <Text style={{ backgroundColor: '#0000005c', width: '50%', paddingLeft: 4, textAlign: 'left', fontWeight: '900', lineHeight: 16, color: 'white' }}>{card?.bottom_left_value}</Text>
                                            <Text style={{ backgroundColor: '#0000005c', width: '50%', paddingRight: 4, textAlign: 'right', fontWeight: '900', lineHeight: 16, color: 'white' }}>{card?.bottom_right_value}</Text>
                                        </View>
                                    </>
                                }
                            </View>
                        </Animated.View>
                    </GestureDetector>
                </Animated.View>
            </GestureDetector>
        </>
    );
}

export function WisdomCard({ wisdom_id, show, enemy, sendToWS }: { wisdom_id: string, show: boolean, enemy?: boolean, sendToWS: (increment: boolean) => void }) {
    const index = Number(wisdom_id.split("_")[2])
    // Double tap to show or hide
    const doubleTap = Gesture.Tap()
        .numberOfTaps(2)
        .onStart(() => {
            if (!enemy) {
                sendToWS(show)
            }
        })
        .runOnJS(true);

    const containerStyle = useAnimatedStyle(() => {
        return {
            position: 'absolute',
            bottom: 0,
            left: index * (CARD_WIDTH + CARD_PADDING_X),
            transform: [
                {
                    scale: withTiming(false ? 1.5 : 1, { duration: 200 })
                },
            ]
        };
    });

    const imageStyle = useAnimatedStyle(() => {
        return {
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            // borderColor: withTiming(isSelected ? '#ff0f' : '#fff0'),
            borderRadius: 4,
            borderWidth: 2,
        };
    });

    return (
        <GestureDetector gesture={doubleTap}>
            <Animated.View style={[containerStyle]}>
                <Animated.View>
                    <View>
                        <Animated.Image
                            source={show ?
                                getCardImage({ card_slug: wisdom_id }) :
                                getCardImage({ card_slug: 'wisdon-back' })
                            }
                            resizeMode="contain"
                            style={[imageStyle]}
                        />
                    </View>
                </Animated.View>
            </Animated.View>
        </GestureDetector>
    );
}

export function DeckCard(props: { card: CardProps, sendToWS: (card: CardProps) => void }) {
    return (
        <Pressable
            onPress={() => {
                props.sendToWS({ ...props.card, where_i_am: 'hand' })
            }}
        >
            <View style={{}}>
                <Image
                    source={
                        getCardImageMini({ card_slug: props.card.slug })
                    }
                    resizeMode="contain"
                    style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
                />
            </View>
        </Pressable>
    );
}
