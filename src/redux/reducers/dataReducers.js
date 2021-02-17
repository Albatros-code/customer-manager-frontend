import {
    GET_SERVICES,
    GET_AVAIABLE_DATES,
} from '../types';

const initialState = {
    services: null,
    avaiableDates: null,
}

export default function dataReducers (state = initialState, action){
    switch(action.type){
        case GET_SERVICES:
            return {
                ...state,
                services: action.payload
            }
        case GET_AVAIABLE_DATES:
            return {
                ...state,
                avaiableDates: action.payload
            }
        default:
            return state;
    }
}