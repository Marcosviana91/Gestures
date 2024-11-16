import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";

import { useDispatch, useSelector } from "react-redux";
import { RootReducer } from "@/store";

import { login, logout } from "@/store/reducers/fakeAuthReducer";

import Table from "@/components/Table";

export default function App() {
    const dispatch = useDispatch();
    const fakeUserData = useSelector((state: RootReducer) => state.fakeAuthReducer.data)

    const [name, setName] = useState("")
    const [sala, setSala] = useState("")

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
        < Table />
    )
}
