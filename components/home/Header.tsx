import { useState } from "react";
import { Pressable, View, Text } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { RootReducer } from "@/store";
import { removeData } from '@/store/database';
import { logout } from "@/store/reducers/dataAuthReducer";

import PlayerAvatar64 from "@/components/PlayerAvatar64";
import { ThemedModal } from "@/components/themed/ThemedModal";
import { ThemedText } from "@/components/themed/ThemedText";
import { ConnectionStatus } from "@/components/connectionSpot";

import { game } from '@/utils/game';


export default function Header() {
    const dispatch = useDispatch();
    const userData = useSelector((state: RootReducer) => state.dataAuthReducer.data)
    const [showExitModal, setShowExitModal] = useState(false)
    return (
        <View>
            <ThemedModal
                title="Encerrar sessão?"
                hideCloseButton
                backgroundTransparent
                dismissable
                visible={showExitModal}
                closeModal={() => {
                    setShowExitModal(false)
                }}
                onRequestClose={() => {
                    setShowExitModal(false)
                }}
            >
                <View style={{ width: '100%', flex: 1, justifyContent: 'space-between' }}>
                    <ThemedText>Será necessário inserir as credenciais novamente.</ThemedText>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Pressable
                            onPress={() => {
                                game.reset()
                                dispatch(logout())
                                removeData('userDataAuth')
                            }}
                        >
                            <View style={{
                                borderColor: '#f00',
                                borderWidth: 2,
                                borderRadius: 8,
                                width: 150,
                                padding: 8,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <ThemedText style={{ fontWeight: 700, color: '#770000', fontSize: 24 }}>Sair</ThemedText>
                            </View>
                        </Pressable>
                        <Pressable
                            onPress={() => {
                                setShowExitModal(false)
                            }}
                        >
                            <View style={{
                                borderColor: '#707070',
                                borderWidth: 2,
                                borderRadius: 8,
                                width: 150,
                                padding: 8,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <ThemedText style={{ fontWeight: 700, color: '#383838', fontSize: 24 }}>Cancelar</ThemedText>
                            </View>
                        </Pressable>
                    </View>
                </View>
            </ThemedModal>
            <View style={{ flexDirection: 'row', gap: 6, padding: 8 }}>
                {/* Botão de sair da conta */}
                <Pressable
                    style={{
                        position: 'absolute',
                        right: 8, top: 8,
                        borderColor: '#f00',
                        borderWidth: 1,
                        borderRadius: 4,
                        padding: 2,
                        justifyContent: 'center', alignItems: 'center'
                    }}
                    onPress={() => {
                        setShowExitModal(true)
                    }}
                >
                    <ThemedText>Encerrar</ThemedText>
                    <MaterialIcons name="logout" size={24} color="#555" />
                </Pressable>
                <PlayerAvatar64 file_name={userData.avatar} />
                <View style={{ justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                        <ThemedText>Nome de usuário:</ThemedText>
                        <ThemedText>{userData.username}</ThemedText>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                        <ThemedText>Nome:</ThemedText>
                        <ThemedText>{userData.first_name}</ThemedText>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                        <ThemedText>E-mail:</ThemedText>
                        <ThemedText>{userData.email}</ThemedText>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                        <ThemedText>ID:</ThemedText>
                        <ThemedText>{userData.id}</ThemedText>
                    </View>
                </View>
            </View>
        </View>
    )
}