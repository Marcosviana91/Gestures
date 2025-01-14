import { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, Platform, TextInput, useColorScheme, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { useSelector } from 'react-redux';
import { RootReducer } from '@/store';

import { BOARD_POSITIONS } from '@/constants/Positions';
import { CARD_HEIGHT, CARD_WIDTH } from '@/constants/Sizes';

import { game } from '@/utils/game';
import { ThemedModal } from '../themed/ThemedModal';
import { ThemedView } from '../themed/ThemedView';
import { ThemedText } from '../themed/ThemedText';

import { getMediaBase64 } from '@/utils/FileSystem/Media';
import { FontAwesome6, Ionicons, AntDesign } from '@expo/vector-icons';
import DeckLoader from './DeckLoader';

type Props = {
    card_id: string,
    sendToWS: (data: WebSocketData) => void,
    menuId: string,
    setMenuId: (menu_id: string) => void,
}

export default function Card({ card_id, sendToWS, menuId, setMenuId }: Props) {
    // console.log('Renderizou  card')
    const userData = useSelector((state: RootReducer) => state.dataAuthReducer.data)
    const deckType = useSelector((state: RootReducer) => state.appReducer.data).selected_game_details?.deckType!;
    const player_card_id = card_id.split('_')[0]
    const player_data = game.getPlayerData(Number(player_card_id))
    const card_game = [...player_data?.cards_in_game!]
    const card = card_game!.find(card => card.in_game_id === card_id)
    const [image64, setImage64] = useState('')
    const [verso_image64, setVerso_image64] = useState('')
    const [showCardMenu, setShowCardMenu] = useState(false)
    const theme = useColorScheme() // light | dark

    // console.log("card", card)
    const card_is_mine = String(userData.id) === card?.in_game_id.split('_')[0]
    const is_hidden = card?.visible ? (player_card_id !== String(userData.id) && card?.where_i_am === 'hand') : true;
    const [isCollided, setIsCollided] = useState(false)
    const [showAttachedCardDescription, setShowAttachedCardDescription] = useState(false)
    const [showPinsModal, setShowPinsModal] = useState(false)
    const [cardDescription, setCardDescription] = useState('')
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
    const [cardTags, setCardTags] = useState(card!.tags)

    // // cópia manipulável do card
    var _card: CardProps = { ...card! }

    const cardBottom = useSharedValue(_card.position.bottom ? _card.position.bottom : 0);
    const cardLeft = useSharedValue(_card.position.left ? _card.position.left : 0);
    const zIndex = useSharedValue(0);

    const [bigger, setBigger] = useState(false)

    const styles = StyleSheet.create({
        cardTags: {
            position: "absolute",
            width: 4,
            height: 15,
            borderRadius: 2,
            zIndex: -1
        }
    })

    // Movimenta a carta automaticamente
    useEffect(() => {
        if (card?.position) {
            cardLeft.value = withTiming(_card.position.left)
            cardBottom.value = withTiming(_card.position.bottom)
        }
    }, [card])

    // Fecha o menu
    useEffect(() => {
        if (menuId !== _card.in_game_id) {
            setShowCardMenu(false)
        }
    }, [menuId])

    // Faz a carta aparecer por cima da outra ao abrir o menu
    useEffect(() => {
        if (showCardMenu) {
            zIndex.value = 1
        } else {
            zIndex.value = 0
        }
    }, [showCardMenu])

    // Set Card Image
    useEffect(() => {
        let path = undefined
        let back = undefined
        for (let deck of deckType) {
            for (let _card of deck.cards) {
                if (_card.card_slug === card?.slug) {
                    back = deck.image
                    if (bigger) {
                        path = _card.card_image
                    } else {
                        path = _card.card_image_mini
                    }
                }
            }
        }
        if (path && Platform.OS === "android") {
            getMediaBase64(path).then(file => setImage64(file))
        }
        if (back && Platform.OS === "android") {
            getMediaBase64(back).then(file => setVerso_image64(file))
        }
    }, [bigger])

    // Set InnerCardDescription
    useEffect(() => {
        if (selectedInnerCard) {
            for (let deck of deckType) {
                for (let _card of deck.cards) {
                    if (_card.card_slug === selectedInnerCard?.slug) {
                        setCardDescription(_card.card_description)
                    }
                }
            }
        }
    }, [selectedInnerCard])

    function updateCardProps() {
        checkYposition()
        checkXposition()
        checkCollision(cardLeft.value, cardBottom.value, true)
        console.log("updateCardProps", _card)
        // game.setCardsOrder({ ..._card })
        if (_card.where_i_am === 'playmat' || _card.where_i_am === 'hand') {
            sendToWS({
                data_type: 'match_data',
                data_command: 'card_move',
                data: {
                    match_id: game.match_id,
                    card: _card
                }
            })
        } else if (_card.where_i_am === 'deck') {
            sendToWS({
                data_type: 'match_data',
                data_command: 'back_to_deck',
                data: {
                    match_id: game.match_id,
                    card: _card
                }
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
        // TODO pegar a posição dos decks pelo REDUX
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
        // Checar colisão com as outras cartas do playmat
        if (_card.where_i_am === 'playmat' && card?.visible) {
            card_game.forEach(card_to_check => {
                if (card_to_check.where_i_am === 'playmat' && card_to_check.in_game_id != _card.in_game_id && card_to_check?.visible) {
                    if (
                        (left > card_to_check.position.left - (CARD_WIDTH / 2)) &&
                        (left < card_to_check.position.left + (CARD_WIDTH / 2)) &&
                        (bottom > card_to_check.position.bottom - (CARD_HEIGHT / 2)) &&
                        (bottom < card_to_check.position.bottom + (CARD_HEIGHT / 2))
                    ) {
                        setIsCollided(true)
                        if (endMove) {
                            _card = { ..._card, where_i_am: "attached" }
                            console.log(`Acoplar a carta ${_card.in_game_id} na carta ${card_to_check.in_game_id} `)
                            // card_to_check.attached_cards.push(_card)
                            // const _card_target: CardProps = { ..._card, attached_cards: [] }
                            card_to_check.attached_cards = [...card_to_check.attached_cards, _card]
                            sendToWS({
                                data_type: 'match_data',
                                data_command: 'attach_card',
                                data: {
                                    match_id: game.match_id,
                                    card: card_to_check,
                                }
                            })
                            setIsCollided(false)
                        }
                    }
                }
            })
        }
    }

    const tapCard = Gesture.Tap()
        .numberOfTaps(1)
        .onStart(() => {
            if (!is_hidden) {
                setBigger(!bigger)
                setShowCardMenu(false)
            }
        })
        .runOnJS(true)

    const drag = Gesture.Pan()
        .minDistance(3)
        .onStart(() => {
            if (card_is_mine) {
                zIndex.value = 1
                setShowCardMenu(false)
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
        })
        .runOnJS(true)

    const showCardMenuGesture = Gesture.LongPress()
        .onStart(() => {
            if (card_is_mine) {
                console.log("SHOW CARD MENU")
                setMenuId(_card.in_game_id)
                setShowCardMenu(!showCardMenu)
            }
        }).runOnJS(true)

    const cardGestures = Gesture.Race(tapCard, drag, showCardMenuGesture)

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
                        data_type: 'match_data',
                        data_command: 'change_top_left_value',
                        data: {
                            match_id: game.match_id,
                            card: _card,
                            faith_points: topLeftValue
                        }
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
                        data_type: 'match_data',
                        data_command: 'change_top_right_value',
                        data: {
                            match_id: game.match_id,
                            card: _card,
                            faith_points: topRightValue
                        }
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
                        data_type: 'match_data',
                        data_command: 'change_bottom_left_value',
                        data: {
                            match_id: game.match_id,
                            card: _card,
                            faith_points: bottomLeftValue
                        }
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
                        data_type: 'match_data',
                        data_command: 'change_bottom_right_value',
                        data: {
                            match_id: game.match_id,
                            card: _card,
                            faith_points: bottomRightValue
                        }
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
            borderWidth: 1,
            borderColor: 'black',
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
                    scale: withTiming(isCollided ? 0.8 : 1, { duration: 50 })
                },
            ]
        };
    });

    const rotateContainerStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    rotateZ: withTiming(`${90 * _card.orientation}deg`)
                }
            ]
        };
    });

    if (!image64 || !verso_image64) { return undefined }

    if (bigger && card_is_mine) {
        return (
            <>
                <GestureDetector gesture={tapCard}>
                    <ThemedView style={{ width: 550, height: 500, position: 'absolute', top: -850, zIndex: 9999, justifyContent: 'center', alignItems: 'center', borderRadius: 16 }}>
                        <View style={{ width: CARD_WIDTH * 6, alignItems: 'center', justifyContent: 'flex-end', rowGap: 8 }}>
                            <Image
                                source={{
                                    uri: image64
                                }}
                                resizeMode="contain"
                                style={{
                                    height: CARD_HEIGHT * 6,
                                    width: CARD_WIDTH * 6,
                                    borderRadius: 8
                                }}
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
                        </View>
                    </ThemedView>
                </GestureDetector>
                {/* Attached Cards */}
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
                                        {/* <Image key={attached_card.in_game_id} source={{
                                            uri: image64
                                        }}
                                            resizeMode="contain"
                                            style={{ height:67, width:48 }}
                                        /> */}
                                        <MiniCard
                                            card={attached_card}
                                            sendToWS={() => {
                                                setShowAttachedCardDescription(!showAttachedCardDescription)
                                                setSelectedInnerCard(attached_card)
                                            }}
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
                                        {cardDescription}
                                    </ThemedText>
                                    {Number(player_card_id) == userData.id &&
                                        <Pressable
                                            style={{ borderWidth: 1, borderColor: '#575757', borderRadius: 8, padding: 8 }}
                                            onPress={() => {
                                                console.log("Remover ", selectedInnerCard?.in_game_id, 'de', _card.in_game_id)
                                                if (selectedInnerCard) {
                                                    _card.attached_cards = [selectedInnerCard]
                                                    sendToWS({
                                                        data_type: 'match_data',
                                                        data_command: 'dettach_card',
                                                        data: {
                                                            match_id: game.match_id,
                                                            card: _card,
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

    if (bigger && !card_is_mine) {
        return (
            <ThemedModal
                closeModal={() => { setBigger(false) }}
                backgroundTransparent
            >
                <View style={{ width: CARD_WIDTH * 6, alignItems: 'center', justifyContent: 'flex-end', rowGap: 8 }}>
                    <Image
                        source={{
                            uri: image64
                        }}
                        resizeMode="contain"
                        style={{
                            height: CARD_HEIGHT * 6,
                            width: CARD_WIDTH * 6,
                            borderRadius: 8
                        }}
                    />
                    {/* Atributos da carta */}
                    {/* top_left_value */}
                    {typeof (card?.top_left_value) == 'number' &&
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
                    }
                    {/* top_right_value */}
                    {typeof (card?.top_right_value) == 'number' &&
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
                    }
                    {/* bottom_left_value */}
                    {typeof (card?.bottom_left_value) == 'number' &&
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
                    }
                    {/* bottom_right_value */}
                    {typeof (card?.bottom_right_value) == 'number' &&
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
                    }
                    {/* Tags list */}
                    <ThemedView style={{ borderColor: '#6e6e6e', borderWidth: 1, width: '100%', padding: 4, maxHeight: 78, flexWrap: 'wrap', justifyContent: 'space-between', alignContent: 'space-between' }}>
                        {_card.tags[0] !== '' && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <View style={{ backgroundColor: '#555', width: 10, height: 10, borderRadius: 5, borderColor: 'white', borderWidth: .3 }} />
                            <ThemedText style={{ fontSize: 12, lineHeight: 14 }}>{_card.tags[0]}</ThemedText>
                        </View>}
                        {_card.tags[1] !== '' && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <View style={{ backgroundColor: '#f0f', width: 10, height: 10, borderRadius: 5, borderColor: 'white', borderWidth: .3 }} />
                            <ThemedText style={{ fontSize: 12, lineHeight: 14 }}>{_card.tags[1]}</ThemedText>
                        </View>}
                        {_card.tags[2] !== '' && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <View style={{ backgroundColor: '#000', width: 10, height: 10, borderRadius: 5, borderColor: 'white', borderWidth: .3 }} />
                            <ThemedText style={{ fontSize: 12, lineHeight: 14 }}>{_card.tags[2]}</ThemedText>
                        </View>}
                        {_card.tags[3] !== '' && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <View style={{ backgroundColor: '#00f', width: 10, height: 10, borderRadius: 5, borderColor: 'white', borderWidth: .3 }} />
                            <ThemedText style={{ fontSize: 12, lineHeight: 14 }}>{_card.tags[3]}</ThemedText>
                        </View>}
                        {_card.tags[4] !== '' && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <View style={{ backgroundColor: '#f00', width: 10, height: 10, borderRadius: 5, borderColor: 'white', borderWidth: .3 }} />
                            <ThemedText style={{ fontSize: 12, lineHeight: 14 }}>{_card.tags[4]}</ThemedText>
                        </View>}
                        {_card.tags[5] !== '' && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <View style={{ backgroundColor: '#0f0', width: 10, height: 10, borderRadius: 5, borderColor: 'white', borderWidth: .3 }} />
                            <ThemedText style={{ fontSize: 12, lineHeight: 14 }}>{_card.tags[5]}</ThemedText>
                        </View>}
                        {_card.tags[6] !== '' && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <View style={{ backgroundColor: '#0ff', width: 10, height: 10, borderRadius: 5, borderColor: 'white', borderWidth: .3 }} />
                            <ThemedText style={{ fontSize: 12, lineHeight: 14 }}>{_card.tags[6]}</ThemedText>
                        </View>}
                        {_card.tags[7] !== '' && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <View style={{ backgroundColor: '#ff0', width: 10, height: 10, borderRadius: 5, borderColor: 'white', borderWidth: .3 }} />
                            <ThemedText style={{ fontSize: 12, lineHeight: 14 }}>{_card.tags[7]}</ThemedText>
                        </View>}
                    </ThemedView>
                    {/* Attached Cards */}
                    {_card.attached_cards.length > 0 &&
                        <ThemedView style={{ width: '100%', height: 200, zIndex: 9999, justifyContent: 'center', alignItems: 'center', borderRadius: 16 }}>
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
                                            <MiniCard
                                                card={attached_card}
                                                sendToWS={() => {
                                                    setShowAttachedCardDescription(!showAttachedCardDescription)
                                                    setSelectedInnerCard(attached_card)
                                                }}
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
                                        <ThemedText type='defaultSemiBold' style={{ flex: 1 }}>
                                            {cardDescription}
                                        </ThemedText>
                                    </ThemedView>
                                </Pressable>
                            }
                        </ThemedView>
                    }
                </View>
            </ThemedModal>
        )
    }

    return (
        <GestureDetector gesture={cardGestures}>
            <Animated.View style={[containerStyle]}>
                <Animated.View>
                    {(is_hidden && card_is_mine) &&
                        <Ionicons
                            name="eye-off"
                            size={32}
                            color="black"
                            style={{
                                textAlign: 'center',
                                backgroundColor: '#ffffffa0',
                                borderRadius: 8
                            }}
                        />
                    }
                    <Animated.View
                        style={[rotateContainerStyle]}
                    >
                        <Animated.Image
                            source={{
                                uri: is_hidden ? (card_is_mine ? image64 : verso_image64) : image64
                            }}
                            resizeMode="contain"
                            style={imageStyle}
                        />
                        {/* Pins */}
                        {true &&
                            <>
                                {/* Esquerdos */}
                                {/* 0 */}
                                {_card.tags[0] !== '' && <View style={[styles.cardTags,{
                                    backgroundColor: '#fff',
                                    top: 0,
                                    left: -4,
                                }]} />}
                                {/* 1 */}
                                {_card.tags[1] !== '' && <View style={[styles.cardTags,{
                                    backgroundColor: '#f0f',
                                    top: 15,
                                    left: -4,
                                }]} />}
                                {/* 2 */}
                                {_card.tags[2] !== '' && <View style={[styles.cardTags,{
                                    backgroundColor: '#000',
                                    top: 30,
                                    left: -4,
                                }]} />}
                                {/* 3 */}
                                {_card.tags[3] !== '' && <View style={[styles.cardTags,{
                                    backgroundColor: '#00f',
                                    top: 45,
                                    left: -4,
                                }]} />}
                                {/* Direitos */}
                                {/* 4 */}
                                {_card.tags[4] !== '' && <View style={[styles.cardTags,{
                                    backgroundColor: '#f00',
                                    top: 0,
                                    right: -4,
                                }]} />}
                                {/* 5 */}
                                {_card.tags[5] !== '' && <View style={[styles.cardTags,{
                                    backgroundColor: '#0f0',
                                    top: 15,
                                    right: -4,
                                }]} />}
                                {/* 6 */}
                                {_card.tags[6] !== '' && <View style={[styles.cardTags,{
                                    backgroundColor: '#0ff',
                                    top: 30,
                                    right: -4,
                                }]} />}
                                {/* 7 */}
                                {_card.tags[7] !== '' && <View style={[styles.cardTags,{
                                    backgroundColor: '#ff0',
                                    top: 45,
                                    right: -4,
                                }]} />}
                            </>
                        }
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
                    </Animated.View>
                    {/* Card Menu */}
                    {showCardMenu &&
                        <View style={{
                            position: 'absolute',
                            width: '100%', height: '100%',
                            zIndex: 10
                        }}>
                            {/* Botão para revelar a carta */}
                            <Pressable
                                onPress={() => {
                                    console.log("REVELAR CARTAS")
                                    setShowCardMenu(false)
                                    sendToWS({
                                        data_type: 'match_data',
                                        data_command: 'toggle_card_visibility',
                                        data: {
                                            match_id: game.match_id,
                                            card: _card,
                                        }
                                    })
                                }}
                                style={{
                                    position: 'absolute', top: '-70%',
                                    width: '100%', height: '70%',
                                    alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: '#fff6',
                                    borderWidth: 1, borderColor: 'black', borderRadius: 6
                                }}
                            >
                                <Ionicons name="eye" size={36} color="black" />
                            </Pressable>
                            {/* Botão para girar a carta para esquerda */}
                            <Pressable
                                onPress={() => {
                                    console.log("GIRAR CARTA PARA ESQUERDA")
                                    sendToWS({
                                        data_type: 'match_data',
                                        data_command: 'rotate_card',
                                        data: {
                                            match_id: game.match_id,
                                            card: _card,
                                            faith_points: -1
                                        }
                                    })
                                    setShowCardMenu(false)
                                }}
                                style={{
                                    position: 'absolute', top: '15%', left: '-100%',
                                    width: '100%', height: '70%',
                                    alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: '#fff6',
                                    borderWidth: 1, borderColor: 'black', borderRadius: 6
                                }}
                            >
                                <FontAwesome6 name="rotate-left" size={36} color="black" />
                            </Pressable>
                            {/* Botão para girar a carta para direita */}
                            <Pressable
                                onPress={() => {
                                    console.log("GIRAR CARTA PARA DIREITA")
                                    sendToWS({
                                        data_type: 'match_data',
                                        data_command: 'rotate_card',
                                        data: {
                                            match_id: game.match_id,
                                            card: _card,
                                            faith_points: 1
                                        }
                                    })
                                    setShowCardMenu(false)
                                }}
                                style={{
                                    position: 'absolute', top: '15%', right: '-100%',
                                    width: '100%', height: '70%',
                                    alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: '#fff6',
                                    borderWidth: 1, borderColor: 'black', borderRadius: 6
                                }}
                            >
                                <FontAwesome6 name="rotate-right" size={36} color="black" />
                            </Pressable>
                            {/* Botão inferior Pinos) */}
                            <Pressable
                                onPress={() => {
                                    console.log("VER PINOS")
                                    setShowCardMenu(false)
                                    setShowPinsModal(true)
                                }}
                                style={{
                                    position: 'absolute', top: '100%', width: '100%', height: '70%',
                                    alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: '#fff6',
                                    borderWidth: 1, borderColor: 'black', borderRadius: 6
                                }}
                            >
                                <AntDesign name="tags" size={36} color="black" />
                            </Pressable>
                        </View>
                    }
                    {/* Tags Form */}
                    <ThemedModal
                        visible={showPinsModal}
                        closeModal={() => { setShowPinsModal(false) }}
                        title='Tags da Carta'
                        dismissable
                        backgroundTransparent
                    >
                        <ThemedView
                            darkColor='#333'
                            lightColor='#ccc'
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                width: '100%',
                                gap: 12,
                                padding: 12,
                                borderRadius: 8
                            }}>
                            {/* Direitos */}
                            <View style={{ flexGrow: 1 }}>
                                <ThemedText style={{ textAlign: 'center' }}>Cinza</ThemedText>
                                <TextInput
                                    value={cardTags[0]}
                                    onChangeText={(text) => {
                                        let _temp_array = [...cardTags]
                                        _temp_array[0] = text
                                        setCardTags(_temp_array)
                                    }}
                                    style={{
                                        borderBottomColor: '#fff',
                                        borderBottomWidth: 1,
                                        textAlign: "center",
                                        color: theme == 'dark' ? "white" : 'black',
                                    }}
                                />
                                <ThemedText style={{ textAlign: 'center' }}>Lilás</ThemedText>
                                <TextInput
                                    value={cardTags[1]}
                                    onChangeText={(text) => {
                                        let _temp_array = [...cardTags]
                                        _temp_array[1] = text
                                        setCardTags(_temp_array)
                                    }}
                                    style={{
                                        borderBottomColor: '#f0f',
                                        borderBottomWidth: 1,
                                        textAlign: "center",
                                        color: theme == 'dark' ? "white" : 'black',
                                    }}
                                />
                                <ThemedText style={{ textAlign: 'center' }}>Preto</ThemedText>
                                <TextInput
                                    value={cardTags[2]}
                                    onChangeText={(text) => {
                                        let _temp_array = [...cardTags]
                                        _temp_array[2] = text
                                        setCardTags(_temp_array)
                                    }}
                                    style={{
                                        borderBottomColor: '#000',
                                        borderBottomWidth: 1,
                                        textAlign: "center",
                                        color: theme == 'dark' ? "white" : 'black',
                                    }}
                                />
                                <ThemedText style={{ textAlign: 'center' }}>Azul</ThemedText>
                                <TextInput
                                    value={cardTags[3]}
                                    onChangeText={(text) => {
                                        let _temp_array = [...cardTags]
                                        _temp_array[3] = text
                                        setCardTags(_temp_array)
                                    }}
                                    style={{
                                        borderBottomColor: '#00f',
                                        borderBottomWidth: 1,
                                        textAlign: "center",
                                        color: theme == 'dark' ? "white" : 'black',
                                    }}
                                />
                            </View>
                            {/* Esquerdos */}
                            <View style={{ flexGrow: 1 }}>
                                <ThemedText style={{ textAlign: 'center' }}>Vermelho</ThemedText>
                                <TextInput
                                    value={cardTags[4]}
                                    onChangeText={(text) => {
                                        let _temp_array = [...cardTags]
                                        _temp_array[4] = text
                                        setCardTags(_temp_array)
                                    }}
                                    style={{
                                        borderBottomColor: '#f00',
                                        borderBottomWidth: 1,
                                        textAlign: "center",
                                        color: theme == 'dark' ? "white" : 'black',
                                    }}
                                />
                                <ThemedText style={{ textAlign: 'center' }}>Verde</ThemedText>
                                <TextInput
                                    value={cardTags[5]}
                                    onChangeText={(text) => {
                                        let _temp_array = [...cardTags]
                                        _temp_array[5] = text
                                        setCardTags(_temp_array)
                                    }}
                                    style={{
                                        borderBottomColor: '#0f0',
                                        borderBottomWidth: 1,
                                        textAlign: "center",
                                        color: theme == 'dark' ? "white" : 'black',
                                    }}
                                />
                                <ThemedText style={{ textAlign: 'center' }}>Ciano</ThemedText>
                                <TextInput
                                    value={cardTags[6]}
                                    onChangeText={(text) => {
                                        let _temp_array = [...cardTags]
                                        _temp_array[6] = text
                                        setCardTags(_temp_array)
                                    }}
                                    style={{
                                        borderBottomColor: '#0ff',
                                        borderBottomWidth: 1,
                                        textAlign: "center",
                                        color: theme == 'dark' ? "white" : 'black',
                                    }}
                                />
                                <ThemedText style={{ textAlign: 'center' }}>Amarelo</ThemedText>
                                <TextInput
                                    value={cardTags[7]}
                                    onChangeText={(text) => {
                                        let _temp_array = [...cardTags]
                                        _temp_array[7] = text
                                        setCardTags(_temp_array)
                                    }}
                                    style={{
                                        borderBottomColor: '#ff0',
                                        borderBottomWidth: 1,
                                        textAlign: "center",
                                        color: theme == 'dark' ? "white" : 'black',
                                    }}
                                />
                            </View>
                        </ThemedView>
                        <Pressable
                            style={{
                                backgroundColor: '#00ff37',
                                padding: 2,
                                paddingHorizontal: 8,
                                borderRadius: 8
                            }}
                            onPress={() => {
                                _card = { ..._card, tags: { ...cardTags } }
                                sendToWS({
                                    data_type: 'match_data',
                                    data_command: 'set_tags',
                                    data: {
                                        match_id: game.match_id,
                                        card: _card,
                                    }
                                })
                                setShowPinsModal(false)
                            }}
                        >
                            <ThemedText>Salvar</ThemedText>
                        </Pressable>

                    </ThemedModal>
                </Animated.View>
            </Animated.View>
        </GestureDetector>
    );
}

// Representação do Deck no tabuleiro
export function DeckCard({ deck_index, sendToWS, setShowAllCards, setShowDeckLoader, menuId, setMenuId }: {
    deck_index: number,
    sendToWS: (data: WebSocketData) => void,
    setShowAllCards: (deck_title: string) => void,
    setShowDeckLoader: (deck_title: string) => void,
    menuId: string,
    setMenuId: (menu_id: string) => void,
}) {
    const userData = useSelector((state: RootReducer) => state.dataAuthReducer.data)
    const deck = useSelector((state: RootReducer) => state.appReducer.data).selected_game_details?.deckType[deck_index]!;
    const player_data = game.getPlayerData(userData.id)
    const [showDeckMenu, setShowDeckMenu] = useState(false);
    const [image64, setImage64] = useState('')

    // Set Card Image
    useEffect(() => {
        if (Platform.OS === "android") {
            getMediaBase64(deck.image).then(file => setImage64(file))
        }
    }, [])

    // Fecha o menu
    useEffect(() => {
        if (menuId !== deck.title) {
            setShowDeckMenu(false)
        }
    }, [menuId])

    const showDeckMenuGesture = Gesture.LongPress()
        .onStart(() => {
            setMenuId(deck.title)
            console.log("SHOW DECK MENU:", deck.title)
            setShowDeckMenu(!showDeckMenu)
        }).runOnJS(true);

    const giveCardTap = Gesture.Tap()
        .numberOfTaps(2)
        .onStart(() => {
            console.log("DAR UMA CARTA:", deck.title.toLowerCase())
            sendToWS({
                data_type: 'match_data',
                data_command: 'give_card',
                data: {
                    match_id: game.match_id,
                    card_family: deck.title.toLowerCase()
                }
            })
            setShowDeckMenu(false)
        }).runOnJS(true);

    const deckMenuGestures = Gesture.Race(giveCardTap, showDeckMenuGesture)

    return (
        <GestureDetector gesture={deckMenuGestures}>
            <View
                style={{
                    position: 'absolute',
                    bottom: deck.deck_position_Y,
                    left: deck.deck_position_X,
                    width: BOARD_POSITIONS.DW.width,
                    height: BOARD_POSITIONS.DW.height,
                    zIndex: showDeckMenu ? 1 : 0,
                    borderColor: 'black',
                    borderWidth: 1
                }}>

                {/* Deck Menu */}
                {showDeckMenu &&
                    <View style={{
                        position: 'absolute',
                        width: '100%', height: '100%',
                        zIndex: 10
                    }}>
                        {/* Botão para embaralhar as cartas */}
                        <Pressable
                            onPress={() => {
                                console.log("MISTURAR CARTAS")
                                setShowDeckMenu(false)
                                sendToWS({
                                    data_type: 'match_data',
                                    data_command: 'shuffle_card',
                                    data: {
                                        match_id: game.match_id,
                                        card_family: deck.title.toLowerCase(),
                                    }
                                })
                            }}
                            style={{
                                position: 'absolute', top: '-70%',
                                width: '100%', height: '70%',
                                alignItems: 'center', justifyContent: 'center',
                                backgroundColor: '#fff6',
                                borderWidth: 1, borderColor: 'black', borderRadius: 6
                            }}
                        >
                            <FontAwesome6 name="shuffle" size={36} color="black" />
                        </Pressable>
                        {/* Botão para exibir cartas do deck (vem em ordem alfabética do servidor) */}
                        <Pressable
                            onPress={() => {
                                console.log("VER CARTAS", deck.title.toLowerCase())
                                setShowAllCards(deck.title.toLowerCase())
                                setShowDeckMenu(false)
                            }}
                            style={{
                                position: 'absolute', top: '100%', width: '100%', height: '70%',
                                alignItems: 'center', justifyContent: 'center',
                                backgroundColor: '#fff6',
                                borderWidth: 1, borderColor: 'black', borderRadius: 6
                            }}
                        >
                            <Ionicons name="eye" size={36} color="black" />
                        </Pressable>
                        {/* Botão para carregar deckBuild */}
                        {/* Gerado em https://costamateus.com.br/faithbattle/deck */}
                        <Pressable
                            onPress={() => {
                                if (player_data!.cards_in_game.length === 0) {
                                    console.log("VER CARTAS CARREGADAS", deck.title.toLowerCase())
                                    setShowDeckMenu(false)
                                    setShowDeckLoader(deck.title.toLowerCase())
                                } else {
                                    ToastAndroid.show('Remova todas as cartas da sua mesa...', ToastAndroid.SHORT)
                                }
                            }}
                            style={{
                                position: 'absolute',
                                top: '15%', left: '100%',
                                width: '100%', height: '70%',
                                alignItems: 'center', justifyContent: 'center',
                                backgroundColor: '#fff6',
                                borderWidth: 1, borderColor: 'black', borderRadius: 6,
                                zIndex: 999999
                            }}
                        >
                            <MaterialCommunityIcons name="cards" size={36} />
                        </Pressable>
                    </View>
                }

                {Boolean(image64)
                    ? <Image
                        style={{
                            flex: 1,
                            borderRadius: 4,
                        }}
                        resizeMode="contain"
                        source={{
                            uri: image64
                        }}
                    />
                    : <Text>...</Text>
                }
            </View>
        </GestureDetector>
    );
}

// Lista de todas as cartas do deck
export function MiniCard({ card, sendToWS }: { card: CardProps, sendToWS: (data: WebSocketData) => void }) {
    const deckType = useSelector((state: RootReducer) => state.appReducer.data).selected_game_details?.deckType!;
    const [image64, setImage64] = useState('')

    // Set Card Image
    useEffect(() => {
        let path = undefined
        for (let deck of deckType) {
            for (let _card of deck.cards) {
                if (_card.card_slug === card?.slug) {
                    path = _card.card_image_mini
                }
            }
        }
        if (path && Platform.OS === "android") {
            getMediaBase64(path).then(file => setImage64(file))
        }
    }, [])

    if (!image64) {
        return undefined
    }
    return (
        <Pressable
            onPress={() => {
                sendToWS({
                    data_type: 'match_data',
                    data_command: 'get_card',
                    data: {
                        match_id: game.match_id,
                        card: card
                    }
                })
            }}
        >
            <Image
                source={{
                    uri: image64
                }}
                style={{
                    width: 48,
                    height: 67,
                    borderRadius: 4
                }}
            />
            {/* Atributos da carta */}
            {/* top_left_value */}
            {typeof (card?.top_left_value) == 'number' &&
                <View style={{
                    backgroundColor: '#000000b2',
                    position: 'absolute', top: 0, left: 0,
                    width: 16, height: 24, borderRadius: 4,
                }}>
                    <Text style={{
                        textAlign: 'center', fontWeight: '900', fontSize: 12, lineHeight: 18,
                        color: 'white',
                    }}>{card?.top_left_value}</Text>

                </View>
            }
            {/* top_right_value */}
            {typeof (card?.top_right_value) == 'number' &&
                <View style={{
                    backgroundColor: '#000000b2',
                    position: 'absolute', top: 0, right: 0,
                    width: 16, height: 24, borderRadius: 4,
                }}>
                    <Text style={{
                        textAlign: 'center', fontWeight: '900', fontSize: 12, lineHeight: 18,
                        color: 'white'
                    }}>{card?.top_right_value}</Text>
                </View>
            }
            {/* bottom_left_value */}
            {typeof (card?.bottom_left_value) == 'number' &&
                <View style={{
                    backgroundColor: '#000000b2',
                    position: 'absolute', bottom: 0, left: 0,
                    width: 16, height: 24, borderRadius: 4,
                }}>
                    <Text style={{
                        textAlign: 'center', fontWeight: '900', fontSize: 12, lineHeight: 18,
                        color: 'white'
                    }}>{card?.bottom_left_value}</Text>
                </View>
            }
            {/* bottom_right_value */}
            {typeof (card?.bottom_right_value) == 'number' &&
                <View style={{
                    backgroundColor: '#000000b2',
                    position: 'absolute', bottom: 0, right: 0,
                    width: 16, height: 24, borderRadius: 4,
                }}>
                    <Text style={{
                        textAlign: 'center', fontWeight: '900', fontSize: 12, lineHeight: 18,
                        color: 'white'
                    }}>{card?.bottom_right_value}</Text>
                </View>
            }
        </Pressable>
    );
}
