import { useEffect, useState } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming, runOnJS } from 'react-native-reanimated';

import { useSelector } from 'react-redux';
import { RootReducer } from '@/store';

import { BOARD_POSITIONS } from '@/constants/Positions';
import { BOARD_WIDTH, CARD_HEIGHT, CARD_PADDING_X, CARD_WIDTH } from '@/constants/Sizes';
import { CARD_HOVER } from '@/constants/Timers';

import { getCardImage, getCardImageMini } from '@/hooks/useCards';
import { game } from '@/utils/game';

type Props = {
    card_id: string,
    sendToWS: (card: CardProps) => void
}

export default function Card({ card_id, sendToWS }: Props) {
    // console.log('Renderizou  card')
    const fakeUserData = useSelector((state: RootReducer) => state.fakeAuthReducer.data)
    const player_card_id = card_id.split('_')[0]
    const player_data = game.getPlayerData(player_card_id)
    const card_game = [...player_data?.card_hand!, ...player_data?.card_playmat!]
    const card = card_game!.find(card => card.in_game_id === card_id)
    const is_hidden = (player_card_id !== fakeUserData.name && card?.where_i_am === 'hand');
    const [isCollided, setIsCollided] = useState(false)

    // cópia manipulável do card
    var _card: CardProps = { ...card! }

    const cardBottom = useSharedValue(_card.position.bottom ? _card.position.bottom : 0);
    const cardLeft = useSharedValue(_card.position.left ? _card.position.left : 0);
    const zIndex = useSharedValue(0);

    const oldPosition = useSharedValue({
        bottom: 0,
        left: 0,
    });

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
        sendToWS({ ..._card })
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
        } else {
            setIsCollided(false)
        }
        // if (
        //     (
        //         left + CARD_WIDTH > _card.position?.left &&
        //         position.left < _card.position?.left + CARD_WIDTH
        //     ) &&
        //     (
        //         _card.position?.bottom &&
        //         position.bottom + CARD_HEIGHT > _card.position?.bottom &&
        //         position.bottom < _card.position?.bottom + CARD_HEIGHT
        //     )
        // ) {
        // console.log('Colidindo com:', _card.in_game_id)
        // TODO: refatorar checkCollision
        // cards.map(_card => {
        //     if (_card.in_game_id !== card_id) {
        //         if (
        //             (
        //                 _card.position?.left &&
        //                 position.left + CARD_WIDTH > _card.position?.left &&
        //                 position.left < _card.position?.left + CARD_WIDTH
        //             ) &&
        //             (
        //                 _card.position?.bottom &&
        //                 position.bottom + CARD_HEIGHT > _card.position?.bottom &&
        //                 position.bottom < _card.position?.bottom + CARD_HEIGHT
        //             )
        //         ) {
        //             // console.log('Colidindo com:', _card.in_game_id)
        //             collision = true
        //             collidedCard = _card
        //             setTimeout(() => {
        //                 hoverCard = _card
        //             }, CARD_HOVER)
        //         }
        //     }
        // })
        // checkHover()
        // if (!collision) {
        //     // console.log('Colidindo com nada')
        //     collidedCard = undefined
        //     hoverCard = undefined
        //     setHoveredCard(undefined)
        // }
    }

    // TODO: Mudar para abrir modal onde será possível alterar os atributos da carta
    const tapCard = Gesture.Tap()
        .numberOfTaps(1)
        .onStart(() => {
            if (!bigger) {
                runOnJS(setBigger)(true)
                oldPosition.value = {
                    bottom: cardBottom.value,
                    left: cardLeft.value,
                }
                cardBottom.value = withTiming(BOARD_POSITIONS.Playmat.bottom),
                    cardLeft.value = withTiming((BOARD_WIDTH - CARD_WIDTH * 6) / 2),
                    zIndex.value = 999
            } else {
                runOnJS(setBigger)(false)
                cardBottom.value = withTiming(oldPosition.value.bottom),
                    cardLeft.value = withTiming(oldPosition.value.left),
                    zIndex.value = withDelay(100, withTiming(0))
            }
        });


    const drag = Gesture.Pan()
        .minDistance(5)
        .onStart(() => {
            if (fakeUserData.name === card?.in_game_id.split('_')[0]) {
                if (!bigger) {
                    zIndex.value = 999
                }
            }
        })
        .onChange((event) => {
            if (fakeUserData.name === card?.in_game_id.split('_')[0]) {
                if (!bigger) {
                    cardBottom.value -= event.changeY;
                    cardLeft.value += event.changeX;
                    checkCollision(cardLeft.value, cardBottom.value, false)
                }
            }
        })
        .onEnd(() => {
            if (fakeUserData.name === card?.in_game_id.split('_')[0]) {
                if (!bigger) {
                    zIndex.value = withDelay(100, withTiming(0))
                    updateCardProps()
                }
            }
            console.log('Bottom: ', cardBottom.value)
            console.log('Left: ', cardLeft.value)
        })
        .runOnJS(true)

    const imageStyle = useAnimatedStyle(() => {
        return {
            width: withTiming(bigger ? CARD_WIDTH * 6 : CARD_WIDTH),
            height: withTiming(bigger ? CARD_HEIGHT * 6 : CARD_HEIGHT),
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


    return (
        <GestureDetector gesture={tapCard}>
            <Animated.View style={[containerStyle]}>
                <GestureDetector gesture={drag}>
                    <Animated.View>
                        {(bigger || false) &&
                            <Animated.Text>{_card.where_i_am}</Animated.Text>
                        }
                        {bigger ?
                            (<Animated.Image
                                source={
                                    is_hidden ?
                                        getCardImage({ card_slug: 'card-back' }) :
                                        getCardImage({ card_slug: _card.slug! })

                                }
                                resizeMode="contain"
                                style={imageStyle}
                            />) :
                            (<View>
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
                            </View>)
                        }
                    </Animated.View>
                </GestureDetector>
            </Animated.View>
        </GestureDetector>
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
