import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type fakeAuth = {
    data: {
        name: string,
        match: string
    }
}

const initialState: fakeAuth = {
    data: {
        name:'',
        match:''
    }
}

const fakeAuthSlice = createSlice({
    name: "matchData",
    initialState,
    reducers: {
        login: (state, action: PayloadAction<fakeAuth>) => {
            state.data.name = action.payload.data.name
            state.data.match = action.payload.data.match
        },
        logout: (state) => {
            state.data = initialState.data
        },

    }
})


export const { login, logout } = fakeAuthSlice.actions
export default fakeAuthSlice.reducer