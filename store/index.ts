import { configureStore } from '@reduxjs/toolkit'
import cardMatchReducer from './reducers/cardMatchReducer'
import fakeAuthReducer from './reducers/fakeAuthReducer'

export const store = configureStore({
    reducer: {
        cardMatchReducer: cardMatchReducer,
        fakeAuthReducer: fakeAuthReducer,
    },
})

export type RootReducer = ReturnType<typeof store.getState>