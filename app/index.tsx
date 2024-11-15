import { useState, useEffect } from "react";
import { useWindowDimensions, View, Text, TextInput, Pressable, Image } from "react-native";

import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";

import { useDispatch, useSelector } from "react-redux";
import { RootReducer } from "@/store";
import { setPlayers, addCard, setCard } from '@/store/reducers/cardMatchReducer';

import { login, logout } from "@/store/reducers/fakeAuthReducer";

import Table from "@/components/Table";
import Magnify from "@/components/Magnify";
import Header from "@/components/Header";

export default function App() {
    const dispatch = useDispatch();
    const fakeUserData = useSelector((state: RootReducer) => state.fakeAuthReducer.data)

    const [name, setName] = useState("")
    const [sala, setSala] = useState("")

    const { width } = useWindowDimensions()

    const TABLE_WIDTH = width * 3
    const TABLE_HEIGHT = 2600
    const svScale = useSharedValue(1);

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

    if (fakeUserData.name === "") {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ width: 250, backgroundColor: 'grey', padding: 16, borderRadius: 8 }}>
                    <Text>Nome</Text>
                    <TextInput style={{ paddingStart: 8, borderWidth: 1 }} value={name} onChangeText={setName} />
                    <Text style={{ marginTop: 16 }}>Sala</Text>
                    <TextInput style={{ paddingStart: 8, borderWidth: 1 }} value={sala} onChangeText={setSala} />
                    <Pressable
                        onPress={() => {
                            if (name !== '' && sala !== '') {
                                if (name === "clear" && sala === "all") {
                                    setName("")
                                    setSala("")
                                    setTimeout(() => { dispatch(logout()) }, 100)
                                }
                                dispatch(login({
                                    data: {
                                        name: name.toLowerCase(),
                                        match: sala.toLowerCase()
                                    }
                                }))
                            }

                        }}>
                        <View style={{ backgroundColor: '#44f', height: 32, width: '100%', justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginTop: 16 }}>
                            <Text style={{ fontWeight: 700 }}>Salvar</Text>
                        </View>
                    </Pressable>
                </View>
            </View>
        )
    }

    return (
        <GestureHandlerRootView  >
            <Header />
            {/* <Magnify scale={svScale} reset_zoom={() => {
                svScale.value = withTiming(1)
            }} /> */}
            <GestureDetector gesture={pinch}>
                <Animated.View style={containerStyle} >
                    <Table />
                </Animated.View >
            </GestureDetector>
        </GestureHandlerRootView>
    )
}
