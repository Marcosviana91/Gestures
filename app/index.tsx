import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { RootReducer } from "@/store";
import { useGetAuthUserDataMutation } from '@/store/api'
import { login } from "@/store/reducers/dataAuthReducer";
import { getData } from '@/store/database';

import Home from "@/pages/home";
import Game from "@/pages/game";
// import Table from "@/components/Table";

export default function App() {
    const dispatch = useDispatch();
    const appData = useSelector((state: RootReducer) => state.appReducer.data)
    const [getUser, { data: userDataAPI, error: userError }] = useGetAuthUserDataMutation();


    useEffect(() => {
        getData('userDataAuth').then(_data => {
            if (_data) {
                getUser(_data)
            }
        })
    }, [])

    useEffect(() => {
        if (userDataAPI) {
            dispatch(login({
                data: userDataAPI
            }))
        }
    }, [userDataAPI])
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
