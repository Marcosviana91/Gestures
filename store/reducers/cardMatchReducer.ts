import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type MatchProps = {
    players: string[],
    cards_attributes: {
        [key: string]: CardProps[]
    }
}

const initialState: MatchProps = {
    players: [],
    cards_attributes: {}
}

const CardMatchSlice = createSlice({
    name: "matchData",
    initialState,
    reducers: {
        setPlayers: (state, action: PayloadAction<MatchProps['players']>) => {
            state.players = action.payload
        },
        addCard: (state, action: PayloadAction<MatchProps['cards_attributes']>) => {
            state.cards_attributes = action.payload
        },
        setCard: (state, action: PayloadAction<{ player_name: string, card: CardProps }>) => {
            const player_name = action.payload.player_name
            const in_game_id = action.payload.card.in_game_id
            const cards = state.cards_attributes[action.payload.player_name].map((card) => {
                if (card.in_game_id !== in_game_id) {
                    return card
                } else {
                    return action.payload.card
                }
            })
            var new_data = {} as WebSocketData['cards']
            new_data![player_name] = cards
            state.cards_attributes = { ...state.cards_attributes, ...new_data }
        },
    }
})


export const { setPlayers, addCard, setCard } = CardMatchSlice.actions
export default CardMatchSlice.reducer