import { configureStore } from '@reduxjs/toolkit'
import dataAuthReducer from './reducers/dataAuthReducer'
import appReducer from './reducers/appReducer'
import api from './api'

export const store = configureStore({
    reducer: {
        appReducer: appReducer,
        dataAuthReducer: dataAuthReducer,
        [api.reducerPath]: api.reducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(api.middleware)
})

export type RootReducer = ReturnType<typeof store.getState>