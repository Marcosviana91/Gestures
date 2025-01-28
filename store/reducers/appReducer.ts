import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type appConfig = {
    data: {
        page: 'home' | 'game',
        selected_game_details: GameDetailsAPI | undefined,
        game: {
            board_id: number,
            nofifications: GameNotification[]
            requests: GameRequest | undefined,
        }
    }
}

const initialState: appConfig = {
    data: {
        page: 'home',
        selected_game_details: undefined,
        game: {
            board_id: 0,
            nofifications: [],
            requests: undefined,
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
        setRequest: (state, action: PayloadAction<GameRequest | undefined>) => {
            state.data.game.requests = action.payload
        },
        addNotification: (state, action: PayloadAction<GameNotification>) => {
            if (state.data.game.nofifications.length == 0) {
                state.data.game.nofifications = [action.payload]
            } else {
                const __temp_array = [...state.data.game.nofifications, action.payload]
                state.data.game.nofifications = __temp_array
            }
        },
        removeNotification: (state, action: PayloadAction<number>) => {
            const __temp_array = state.data.game.nofifications.filter(notf => notf.id !== action.payload)
            state.data.game.nofifications = __temp_array
        },
    }
})


export const { setPage, setSelectedGame, setGameSettings, setRequest, addNotification, removeNotification } = dataAuthSlice.actions
export default dataAuthSlice.reducer