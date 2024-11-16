import { Image, View, StyleSheet, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSelector } from 'react-redux';
// import { setPlayers } from '@/store/reducers/cardMatchReducer';

import useAppWebSocket from '@/hooks/useAppWebSocket'


import Magnify from "@/components/Magnify";
import Header from "@/components/Header";
import Board from './Board';
import { BOARD_WIDTH, BOARD_HEIGHT, CARD_HEIGHT } from '@/constants/Sizes';
import { RootReducer } from '@/store';
// import { useEffect } from 'react';
import { game } from '@/utils/game';
import Room from './Room';

export default function Table() {
    // console.log("Renderizou Table")
    const fakeUserData = useSelector((state: RootReducer) => state.fakeAuthReducer.data)
    // const dispatch = useDispatch()
    const WS = useAppWebSocket()

    const oponentes_list = game.players.filter(p => p !== fakeUserData.name)
    // console.log("oponentes_list", oponentes_list)

    const { width } = useWindowDimensions()
    const TABLE_WIDTH = width * 3
    const TABLE_HEIGHT = 2600
    const BOARD_LEFT_START = width
    const boardsLeft = useSharedValue(BOARD_LEFT_START);
    const boardsBottom = useSharedValue(0);

    const svScale = useSharedValue(1);


    // useEffect(() => {
    //     if (WS.lastJsonMessage) {
    //         const data = WS.lastJsonMessage as WebSocketData
    //         if (data.data_type == 'start' && data.room_stats) {
    //             dispatch(setPlayers(data.room_stats.players))
    //             game.id = data.room_stats.id
    //             game.players = data.room_stats.players
    //             game.players_stats = data.room_stats.players_stats
    //             console.log(game)
    //         }
    //     }
    // }, [WS.lastJsonMessage])

    // useEffect(() => {
    //     props.setWsState(WS.readyState)
    // }, [WS.readyState])

    const boardStyle = useAnimatedStyle(() => {
        return {
            position: "absolute",
            left: boardsLeft.value + (BOARD_WIDTH / 2),
            bottom: boardsBottom.value - BOARD_HEIGHT / 2,
            transform: [
                {
                    rotate: '0deg'
                },
                {
                    translateX: -BOARD_WIDTH / 2,
                },
                {
                    translateY: -BOARD_HEIGHT / 2,
                }
            ]
        }
    })

    const style = StyleSheet.create({
        container: {
            backgroundColor: 'gray',
            position: "relative",
            width: TABLE_WIDTH,
            height: TABLE_HEIGHT,
        },
        background: {
            zIndex: -1,
            width: '100%',
            height: '100%',
            resizeMode: 'stretch',
        },
    })

    const drag = Gesture.Pan()
        .onStart(() => {
            console.log("Drag")
        })
        .onChange((event) => {
            // console.log(event.changeX)
            boardsLeft.value += event.changeX
            boardsBottom.value -= event.changeY
        })
        .onEnd((event) => {

        })
        .runOnJS(false)

    function sendMoveToServer(data: {}) {
        WS.sendJsonMessage(data)
    }

    const pinch = Gesture.Pinch()
        .onStart(() => {
        })
        .onChange((event) => {
            svScale.value *= event.scaleChange
            // console.log(svScale.value)
        })
        .onEnd(() => {
            if (svScale.value > 2) {
                svScale.value = withTiming(2)
            }
            else if (svScale.value < 0.33) {
                svScale.value = withTiming(0.33)
            }
        })

    const containerStyle = useAnimatedStyle(() => {
        return {
            borderColor: 'black',
            borderWidth: 1,
            position: "absolute",
            bottom: -(TABLE_HEIGHT * (1 - svScale.value)) / 2,
            left: -TABLE_WIDTH / 3,
            transform: [
                {
                    scale: svScale.value,
                }
            ]
        };
    });

    if (game.players_stats.length < 1) {
        return <>
            <Room sendWS={WS.sendJsonMessage} />
        </>
    }
    return (
        <GestureHandlerRootView  >
            <Header sendWS={sendMoveToServer} />
            <GestureDetector gesture={pinch}>
                <Animated.View style={containerStyle} >
                    <Animated.View style={style.container}>
                        <Image
                            style={style.background}
                            source={require('@/assets/images/wood.jpg')}
                        />
                        <GestureDetector gesture={drag}>
                            <Animated.View style={boardStyle}>
                                <View style={{ zIndex: 10 }}>
                                    <Board player_name={fakeUserData.name} sendToWS={sendMoveToServer} />
                                </View>
                                {/* Oponente 1 */}
                                <View style={{
                                    bottom: BOARD_HEIGHT * 2,
                                    left: BOARD_WIDTH,
                                    transform: [
                                        {
                                            rotate: '180deg',
                                        },
                                    ]
                                }}>
                                    <Board enemy player_name={oponentes_list[0]} sendToWS={sendMoveToServer} />
                                </View>
                                {/* Oponente 2 */}
                                {/* <View style={{
                        bottom: 700,
                        left: 800,
                        transform:[
                            {
                                rotate:'240deg',
                            },
                        ]
                    }}>
                        <Board />
                    </View> */}
                            </Animated.View>
                        </GestureDetector>
                    </Animated.View>
                </Animated.View >
            </GestureDetector>

        </GestureHandlerRootView>
    )
}