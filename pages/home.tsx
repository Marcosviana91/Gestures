import { useSelector } from "react-redux";

import { RootReducer } from "@/store";

import GameList from "@/components/GameList";
import Header from "@/components/home/Header";
import Login from "@/components/home/login";
import { ThemedView } from "@/components/themed/ThemedView";

export default function Home() {
    const userData = useSelector((state: RootReducer) => state.dataAuthReducer.data)
    if (userData.id === 0) {
        return <Login />
    }
    return (
        <ThemedView style={{flex:1}}>
            <Header />
            <GameList />
        </ThemedView>
    )
}