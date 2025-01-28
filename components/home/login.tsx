import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { View, TextInput, Pressable, StyleSheet, Linking, useColorScheme, ToastAndroid, Platform } from "react-native";
import Animated, { withTiming, withSequence, withDelay, useSharedValue, useAnimatedStyle} from 'react-native-reanimated';

import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedView } from "../themed/ThemedView";
import { ThemedText } from "../themed/ThemedText";

import { useLoginMutation, useGetAuthUserDataMutation } from '@/store/api'
import { storeData } from '@/store/database';
import { login } from "@/store/reducers/dataAuthReducer";
import FullLoading from "../general/Loading";


export default function Login() {
    const dispatch = useDispatch();
    const theme = useColorScheme() // light | dark
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [hidePassword, setHidePassword] = useState(true)
    const [loading, setLoading] = useState(false)

    const [doLogin, { data: tokenAuthData, error: authError }] = useLoginMutation();
    const [getUser, { data: userData, error: userError }] = useGetAuthUserDataMutation();


    useEffect(() => {
        console.log("tokenAuthData", tokenAuthData)
        if (tokenAuthData?.access_token) {
            storeData('userDataAuth', {
                access_token: tokenAuthData.access_token,
            })
            getUser(tokenAuthData)
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (tokenAuthData?.status_code == 400 || tokenAuthData?.status_code == 403) {
            setLoading(false)
            if (Platform.OS === 'android') {
                ToastAndroid.show('Usuário ou senha inválida!', ToastAndroid.SHORT);
            } else {
                console.log('Usuário ou senha inválida!')
            }
        }
        if (authError) {
            setLoading(false)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (authError.status === 'FETCH_ERROR') {
                if (Platform.OS === 'android') {
                    ToastAndroid.show('Não foi possível acessar o servidor', ToastAndroid.SHORT);
                } else {
                    console.log('Não foi possível acessar o servidor')
                }
            }
        }
    }, [tokenAuthData, authError])

    useEffect(() => {
        if (userData) {
            // console.log("userData", userData)
            dispatch(login({
                data: userData
            }))
            setLoading(false)
        }
    }, [userData])

    const loginStyle = StyleSheet.create({
        loginContainer: {
            padding: 10,
            borderWidth: 1,
            borderRadius: 8,
            gap: 8,
            borderColor: theme === "light" ? 'black' : 'white'
        },
        textInputContainer: {

        },
        textInputLabel: {
            fontSize: 20,
        },
        textInput: {
            width: 200,
            borderWidth: 1,
            borderColor: 'black',
            borderRadius: 8,
            backgroundColor: 'white',
            padding: 2
        },
        buttonLogin: {
            backgroundColor: (username === '' || password === '') ? theme === 'light' ? '#ccc' : '#555' : theme === 'light' ? '#98ff98' : '#004600',
            borderRadius: 4,
            paddingVertical: 2,
            alignItems: "center",
            borderColor: theme === "light" ? 'black' : 'white',
            borderWidth: 1,

        }
    })

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <AnimatedBackground />
            {loading && <FullLoading />}

            <ThemedView style={loginStyle.loginContainer}>
                <View style={loginStyle.textInputContainer}>
                    <ThemedText style={loginStyle.textInputLabel}>Nome de usuário:</ThemedText>
                    <TextInput textContentType="username" value={username} style={loginStyle.textInput} onChangeText={setUsername} />
                </View>
                <View style={loginStyle.textInputContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                        <ThemedText style={loginStyle.textInputLabel}>Senha:</ThemedText>
                        <Pressable
                            onPress={() => {
                                setHidePassword(!hidePassword)
                            }}
                        >
                            <Ionicons name={hidePassword ? "eye-off" : "eye"} size={24} color="black" />
                        </Pressable>
                    </View>
                    <TextInput
                        textContentType="password"
                        secureTextEntry={hidePassword}
                        value={password}
                        style={loginStyle.textInput}
                        onChangeText={setPassword} />
                </View>
                {/* Botão de login */}
                <Pressable
                    disabled={username === '' || password === ''}
                    onPress={() => {
                        setLoading(true)
                        doLogin({
                            username: username, password: password
                        })
                    }}
                >
                    <View
                        style={loginStyle.buttonLogin}
                    >
                        <ThemedText style={loginStyle.textInputLabel}>
                            Logar
                        </ThemedText>
                    </View>
                </Pressable>
                {/* Botão criar conta */}
                <Pressable
                    onPress={() => {
                        Linking.canOpenURL('https://faith-battle.marcosvianadev.com.br/users/login/').then(() => {
                            Linking.openURL('https://faith-battle.marcosvianadev.com.br/users/login/')
                        })
                    }}
                >
                    <View
                        style={[loginStyle.buttonLogin, { backgroundColor: theme === 'light' ? '#5cfff7' : '#002daa' }]}
                    >
                        <ThemedText style={loginStyle.textInputLabel}>
                            Criar conta
                        </ThemedText>
                    </View>
                </Pressable>
            </ThemedView>
        </View>
    )
}

function AnimatedBackground() {
    const [backGroundImage, setBackGroundImage] = useState(0)
    const backGroundImageScale = useSharedValue(1)
    const backGroundImageOpacity = useSharedValue(1)

    const background_list = [
        require('@/assets/images/bg_alpha_01.png'),
        require('@/assets/images/bg_alpha_02.png'),
        require('@/assets/images/bg_genesis_01.png'),
        require('@/assets/images/bg01.png'),
        require('@/assets/images/bg02.png'),
        require('@/assets/images/bg03.png'),
        require('@/assets/images/bg04.png'),
    ]

    const backgroundStyle = useAnimatedStyle(() => {
        return {
            height: '100%',
            width: '100%',
            resizeMode: 'stretch',
            position: 'absolute',
            backgroundColor: 'black',
            transform: [
                {
                    scale: backGroundImageScale.value
                },
            ],
            opacity: backGroundImageOpacity.value,
        }
    })

    // Change background
    const BACKGROUND_ANIMATION_DURATION = 15000
    useEffect(() => {
        backGroundImageScale.value = 1
        backGroundImageScale.value = withSequence(withTiming(1.1, { duration: BACKGROUND_ANIMATION_DURATION / 3 }), withDelay(BACKGROUND_ANIMATION_DURATION / 3, withTiming(1, { duration: BACKGROUND_ANIMATION_DURATION / 3 })))

        backGroundImageOpacity.value = withSequence(withTiming(1, { duration: BACKGROUND_ANIMATION_DURATION * 0.1 }), withDelay(BACKGROUND_ANIMATION_DURATION * 0.8, withTiming(0, { duration: BACKGROUND_ANIMATION_DURATION * 0.1 })))
        setTimeout(() => {
            if (backGroundImage < background_list.length - 1) {
                setBackGroundImage(backGroundImage + 1)
            } else {
                setBackGroundImage(0)
            }
        }, BACKGROUND_ANIMATION_DURATION)
    }, [backGroundImage])

    return (
        <Animated.Image
            style={backgroundStyle}
            source={background_list[backGroundImage]}
            blurRadius={4}
        />
    )
}