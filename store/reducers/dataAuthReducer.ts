import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type userData = {
    data: UserProps
}

const initialState: userData = {
    data: {
        id: 0,
        last_login: '',
        username: '',
        email: '',
        first_name: '',
        avatar: '',
    }
}

const dataAuthSlice = createSlice({
    name: "authData",
    initialState,
    reducers: {
        login: (state, action: PayloadAction<userData>) => {
            state.data = action.payload.data
        },
        logout: (state) => {
            state.data = initialState.data
        },

    }
})


export const { login, logout } = dataAuthSlice.actions
export default dataAuthSlice.reducer