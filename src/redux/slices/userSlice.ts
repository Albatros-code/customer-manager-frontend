import { createSlice } from '@reduxjs/toolkit'
import jwt_decode from "jwt-decode";

import { api } from '../../util/util'

import { LOADING_UI, stopLoadingUi} from './uiSlice'

// types
import { AnyAction } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { PayloadAction } from '@reduxjs/toolkit'
import { AxiosResponse } from 'axios'

import { RootState } from '../store'
import { IUsersIDAPI, ITokenRefreshAPI, IDecodedJWT } from '../../interfaces'


interface IUserReduxState {
    authenticated: boolean,
    id: string | undefined,
    username?: string | undefined,
    role: string | undefined,
    data: IUsersIDAPI['doc']['data'] | {},
    settings: IUsersIDAPI['doc']['settings'] | {},
}

const initialState: IUserReduxState = {
    authenticated: false,
    id: undefined,
    username: undefined,
    role: undefined,
    data: {},
    settings: {},
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        SET_USER: (state, action: PayloadAction<Omit<IUserReduxState, 'authenticated'>>) => {
            state.id = action.payload.id
            state.role = action.payload.role
            state.data = action.payload.data
            state.settings = action.payload.settings
        },
        SET_AUTHENTICATED: (state) => {
            state.authenticated = true
        },
        SET_UNAUTHENTICATED: (state) => {
            state.authenticated = false
            state.username = undefined
            state.role = undefined
            state.data = {}
            state.settings = {}
        },
    }
})

export const {SET_USER, SET_AUTHENTICATED, SET_UNAUTHENTICATED} = userSlice.actions

export default userSlice.reducer

export const selectUser = (state: RootState) => state.user


// export interface ILoginUser {
//     (username:string, password: string, remember: boolean): ThunkAction<Promise<string>, {}, {}, AnyAction>
//     // (username:string, password: string, remember: boolean, history: any):Promise<string>
// }

export const loginUser = (username:string, password: string, remember: boolean): ThunkAction<Promise<string>, RootState, unknown, AnyAction> => (
    (dispatch) => {
        return new Promise(async (resolve, reject) => {
            dispatch(LOADING_UI)
            try {
                const fetchedData = await api.post<ITokenRefreshAPI>('/login', {
                    username: username,
                    password: password,
                    remember: remember,
                }, {withCredentials: true})
                await dispatch(afterLoginAction(fetchedData))
                resolve('resolved successfully')
            } catch (err) {
                reject(err)
            } finally {
                dispatch(stopLoadingUi)
            }
        })
    }
) 

export const afterLoginAction = (fetchedData: AxiosResponse<ITokenRefreshAPI>):ThunkAction<Promise<void>, RootState, unknown, AnyAction> => (
    async (dispatch) => {
        // set common authorization header for api calls
        const token = `Bearer ${fetchedData.data.access_token}`
        api.defaults.headers.common['Authorization'] = token
        // set user
        const { sub: { id, role } } = jwt_decode<IDecodedJWT>(token)
        await dispatch(setUser(id, role));
        dispatch(SET_AUTHENTICATED());
    }
)


// export interface ISetUser {
//     (id: string, role: string):ThunkAction<Promise<string>, RootState, unknown, AnyAction>
// }

export const setUser = (id: string, role: string): ThunkAction<Promise<string>, RootState, unknown, AnyAction> => (
    (dispatch) => {
        return new Promise(async (resolve, reject) => {
            try {
                const fetchedData = await api.get<IUsersIDAPI>(`/users/${id}`)
                dispatch(SET_USER({
                    id: id,
                    role: role,
                    data: fetchedData.data.doc.data,
                    settings: fetchedData.data.doc.settings,
                }))
                resolve('resolved successfully')
            } catch (err) {
                reject(err)
            }
        })
    }
)


export const logoutUser = (onResolve?: () => any, onReject?: () => any): ThunkAction<void, RootState, unknown, AnyAction> => (
    async (dispatch) => {
        delete api.defaults.headers.common["Authorization"]
        try {
            await api.post('/logout/refresh', {}, {withCredentials: true})
            dispatch(SET_UNAUTHENTICATED());
            if (onResolve) onResolve()
        } catch (err) {
            if (onReject) onReject()
        }
    }
)