import {
    // LOGIN_USER,
    SET_AUTHENTICATED,
    SET_UNAUTHENTICATED,
    SET_USER,
    CLEAR_USER_CREDENTIALS,
    // LOGOUT_USER,
    // LOADING_USER
} from '../types';

const initialState = {
    authenticated: false,
    username: null,
    role: null,
    data: {}
}

export default function userReducers (state = initialState, action){
    switch(action.type){
        case SET_USER:
            return {
                ...state,
                ...action.payload
            }
        case SET_AUTHENTICATED:
            return {
                ...state,
                authenticated: true
            }
        case SET_UNAUTHENTICATED:
            return {
                authenticated: false,
                username: null,
                role: null,
                data: {}
            }
        case CLEAR_USER_CREDENTIALS:
            return {
                ...state,
                user: {}
            }
        default:
            return state;
    }
}