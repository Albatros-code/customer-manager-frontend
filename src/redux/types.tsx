// Data reducers types
export const SET_INITIALDATA = "SET_INITIALDATA"
export const SET_SERVICES = "SET_SERVICES"
export const SET_AVAILABLE_DATES = "SET_AVAILABLE_DATES"

// User reducers types
export const LOGIN_USER = "LOGIN_USER"
export const LOGOUT_USER = "LOGOUT_USER"
export const LOADING_USER = "LOADING_USER"
export const SET_AUTHENTICATED = "SET_AUTHENTICATED"
export const SET_UNAUTHENTICATED = "SET_UNAUTHENTICATED"
export const SET_USER = "SET_USER"
export const CLEAR_USER_CREDENTIALS = "CLEAR_USER_CREDENTIALS"

// UI reducers types
export const LOADING_UI = "LOADING_UI"
export const STOP_LOADING_UI = "STOP_LOADING_UI"
export const SET_ERRORS = "SET_ERRORS"
export const CLEAR_ERRORS = "CLEAR_ERRORS"

export interface IReduxState {
    data: {
        services: Array<any> | null,
        avaiableDates: Array<any> | null,
        settings: Array<any> | null,
    },
    user: {
        authenticated: boolean,
        id: string,
        username: string,
        role: string,
        data: any,
        settings: any,
    },
    ui: {
        loading: boolean,
    }
}