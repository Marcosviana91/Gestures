import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { RootReducer } from "@/store";
import { useGetAuthUserDataMutation } from '@/store/api'
import { login } from "@/store/reducers/dataAuthReducer";
import { getData } from '@/store/database';

import Home from "@/pages/home";
import Game from "@/pages/game";
import FullLoading from "@/components/general/Loading";
// import Table from "@/components/Table";

export default function App() {
    const dispatch = useDispatch();
    const appData = useSelector((state: RootReducer) => state.appReducer.data)
    const [getUser, { data: userDataAPI, isLoading }] = useGetAuthUserDataMutation();
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        console.log("inicio:", Date.now());
        getData('userDataAuth').then(_data => {
            if (_data) {
                getUser(_data)
                setLoading(false);
            }
        })
    }, [])

    useEffect(() => {
        console.log("userDataAPI", userDataAPI);
        if (userDataAPI) {
            setLoading(isLoading);
        }
        if (userDataAPI && userDataAPI.id) {
            dispatch(login({
                data: userDataAPI
            }))
            console.log("fim LOGADO:", Date.now());
            setLoading(isLoading);
        } else {
            // TODO: aviso de não logado
            console.log("fim NÃO:", Date.now());
            setLoading(isLoading);
        }
    }, [userDataAPI])

    if (loading) {
        return <FullLoading />
    }

    switch (appData.page) {
        case 'game':
            return (
                <Game />
            )

        default:
            return (
                <Home />
            )
    }
}
