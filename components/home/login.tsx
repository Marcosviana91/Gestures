import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { View, Text, TextInput, Pressable, StyleSheet, Linking } from "react-native";

import Ionicons from '@expo/vector-icons/Ionicons';

import { useLoginMutation, useGetAuthUserDataMutation } from '@/store/api'
import { storeData } from '@/store/database';
import { login } from "@/store/reducers/dataAuthReducer";


export default function Login() {
    const dispatch = useDispatch();
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [hidePassword, setHidePassword] = useState(true)

    const [doLogin, { data: tokenAuthData, error: authError }] = useLoginMutation();
    const [getUser, { data: userData, error: userError }] = useGetAuthUserDataMutation();

    useEffect(() => {
        if (tokenAuthData?.access_token) {
            // console.log("tokenAuthData", tokenAuthData)
            storeData('userDataAuth', {
                access_token: tokenAuthData.access_token,
            })
            getUser(tokenAuthData)
        }
        if (authError) {
            if (authError.status === 'FETCH_ERROR') {
                // TODO Notificação
                console.log('Não foi possível acessar o servidor')
            }
        }
    }, [tokenAuthData, authError])

    useEffect(() => {
        if (userData) {
            // console.log("userData", userData)
            dispatch(login({
                data: userData
            }))
        }
    }, [userData])
    const loginStyle = StyleSheet.create({
        loginContainer: {
            borderColor: '#fff',
            padding: 10,
            borderWidth: 1,
            borderRadius: 8,
            gap: 8,
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
            backgroundColor: (username === '' || password === '') ? '#003d00' : '#0f0',
            borderRadius: 4,
            paddingVertical: 2,
            alignItems: "center",

        }
    })

    return (
        <View style={{ backgroundColor: 'gray', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <View style={loginStyle.loginContainer}>
                <View style={loginStyle.textInputContainer}>
                    <Text style={loginStyle.textInputLabel}>Nome de usuário:</Text>
                    <TextInput textContentType="username" value={username} style={loginStyle.textInput} onChangeText={setUsername} />
                </View>
                <View style={loginStyle.textInputContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                        <Text style={loginStyle.textInputLabel}>Senha:</Text>
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
                        doLogin({
                            username: username, password: password
                        })
                    }}
                >
                    <View
                        style={loginStyle.buttonLogin}
                    >
                        <Text style={loginStyle.textInputLabel}>
                            Logar
                        </Text>
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
                        style={[loginStyle.buttonLogin, {backgroundColor:'#f50'}]}
                    >
                        <Text style={loginStyle.textInputLabel}>
                            Criar conta
                        </Text>
                    </View>
                </Pressable>
            </View>
        </View>
    )
}