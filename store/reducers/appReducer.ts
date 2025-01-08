import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type appConfig = {
    data: {
        page: 'home' | 'game',
        selected_game_details: GameDetailsAPI | undefined,
        game: {
            board_id: number,
        }
    }
}

const initialState: appConfig = {
    data: {
        page: 'home',
        selected_game_details: undefined,
        game: {
            board_id: 0
        }
    }
}

const dataAuthSlice = createSlice({
    name: "appConfig",
    initialState,
    reducers: {
        setPage: (state, action: PayloadAction<appConfig['data']['page']>) => {
            state.data.page = action.payload
        },
        setSelectedGame: (state, action: PayloadAction<appConfig['data']['selected_game_details']>) => {
            state.data.selected_game_details = action.payload
        },
        setGameSettings: (state, action: PayloadAction<appConfig['data']['game']>) => {
            state.data.game = action.payload
        },
    }
})


export const { setPage, setSelectedGame, setGameSettings } = dataAuthSlice.actions
export default dataAuthSlice.reducer