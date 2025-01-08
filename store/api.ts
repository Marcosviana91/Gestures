import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const API =  process.env.EXPO_PUBLIC_API_URL;

const api = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: `http://${API}`
    }),
    endpoints: (builder) => ({
        getServerData: builder.query<any, void>({
            query: () => ({
                url: "/",
            })
        }),
        getGameList: builder.query<GameListAPI, void>({
            query: () => ({
                url: "/api/games",
            })
        }),
        getGameDetails: builder.query<GameDetailsAPI, string>({
            query: game_id => ({
                url: `/api/games/${game_id}`,
            })
        }),
        getGameDLC: builder.query<string[], string>({
            query: game_id => ({
                url: `/api/dlc/${game_id}`,
            })
        }),
        login: builder.mutation<TokenAuthProps, AuthProps>({// tipa o response, tipa o request
            query: token => ({
                url: "/api/auth",
                method: "POST",
                body: token,
            })
        }),
        getAuthUserData: builder.mutation<UserProps, TokenAuthProps>({// tipa o response, tipa o request
            query: userData => ({
                url: "/api/user",
                method: "POST",
                body: userData,
            })
        }),
        getUserData: builder.query<UserProps, number>({
            query: userId => ({
                url: `/api/user/${userId}`,
                method: 'GET',
            })
        }),
    })
})


export const {
    useGetServerDataQuery,
    useGetGameListQuery,
    useGetGameDetailsQuery,
    useGetGameDLCQuery,
    useLoginMutation,
    useGetAuthUserDataMutation,
    useGetUserDataQuery,
} = api
export default api