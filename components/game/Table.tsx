// import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Image, View, StyleSheet, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';


import Board from './Board';
import { BOARD_WIDTH, BOARD_HEIGHT } from '@/constants/Sizes';
import { RootReducer } from '@/store';
import { game } from '@/utils/game';
import BoardSettings from './Settings';

export default function Table({ sendWS }: { sendWS: (dict: {}) => void }) {
    // console.log("Renderizou Table")
    const dataAuthReducer = useSelector((state: RootReducer) => state.dataAuthReducer.data)
    function reorderOponentList() {
        const my_position_in_list = game.players.findIndex(str => str === dataAuthReducer.id)
        const __temp_array_start = game.players.slice(0, my_position_in_list)
        const __temp_array_end = game.players.slice(my_position_in_list + 1)
        return [...__temp_array_end, ...__temp_array_start]
    }


    const oponentes_list = reorderOponentList()

    const { width } = useWindowDimensions()
    const TABLE_WIDTH = width * 3
    const TABLE_HEIGHT = 2600
    const BOARD_LEFT_START = width
    const boardsLeft = useSharedValue(BOARD_LEFT_START);
    const boardsBottom = useSharedValue(0);

    const svScale = useSharedValue(1);


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
            console.log(svScale.value)
        })
        .onChange((event) => {
            // console.log(event.changeX)
            boardsLeft.value += (event.changeX / svScale.value)
            boardsBottom.value -= (event.changeY / svScale.value)
        })
        .onEnd((event) => {

        })
        .runOnJS(false)

    const pinch = Gesture.Pinch()
        .onStart(() => {
        })
        .onChange((event) => {
            svScale.value *= event.scaleChange
            // setZoom(svScale.value)
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


    function EnemyBoardsPosition() {
        if (oponentes_list.length == 1) {
            return [
                {
                    bottom: BOARD_HEIGHT * 2,
                    left: BOARD_WIDTH,
                    transform: [
                        {
                            rotate: '180deg',
                        },
                    ]
                }
            ]
        }
        if (oponentes_list.length == 2) {
            return [
                {
                    bottom: 1065,
                    left: -65,
                    transform: [
                        {
                            rotate: '120deg',
                        },
                    ]
                },
                {
                    bottom: 590,
                    left: 890,
                    transform: [
                        {
                            rotate: '240deg',
                        },
                    ]
                }
            ]
        }
        if (oponentes_list.length == 3) {
            return [
                {
                    bottom: 930,
                    left: -380,
                    transform: [
                        {
                            rotate: '90deg',
                        },
                    ]
                },
                {
                    bottom: 1310,
                    left: 550,
                    transform: [
                        {
                            rotate: '180deg',
                        },
                    ]
                },
                {
                    bottom: 380,
                    left: 930,
                    transform: [
                        {
                            rotate: '270deg',
                        },
                    ]
                },
            ]
        }
        if (oponentes_list.length == 4) {
            return [
                {
                    bottom: 790,
                    left: -550,
                    transform: [
                        {
                            rotate: '72deg',
                        },
                    ]
                },
                {
                    bottom: 1558,
                    left: 33,
                    transform: [
                        {
                            rotate: '144deg',
                        },
                    ]
                },
                {
                    bottom: 1243,
                    left: 940,
                    transform: [
                        {
                            rotate: '216deg',
                        },
                    ]
                },
                {
                    bottom: 280,
                    left: 920,
                    transform: [
                        {
                            rotate: '288deg',
                        },
                    ]
                },
            ]
        }
        return [{}]
    }

    return (
        <GestureHandlerRootView  >
            <BoardSettings />
            {/* <Magnify scale={svScale} reset_zoom={()=>{}} /> */}
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
                                    <Board player_id={dataAuthReducer.id} sendToWS={sendWS} />
                                </View>
                                {/* Oponentes */}
                                {oponentes_list.map((oponente, _index) =>
                                    <View
                                        key={_index}
                                        style={EnemyBoardsPosition()[_index]}
                                    >
                                        <Board enemy player_id={oponente} sendToWS={sendWS} />
                                    </View>
                                )}
                            </Animated.View>
                        </GestureDetector>
                    </Animated.View>
                </Animated.View >
            </GestureDetector>
        </GestureHandlerRootView>
    )
}