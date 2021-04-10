import {
    GET_INITIALDATA,
    GET_SERVICES,
    GET_AVAIABLE_DATES,
} from '../types'

import { api } from '../../util/util'

export const getInitialData = () => (dispatch) => {
    return new Promise((resolve, reject) => {
        api.get('/settings')
            .then((res) => {
                dispatch({
                    type: GET_INITIALDATA,
                    payload: res.data,
                })
                return resolve(res)
            }, (err) => {
                reject(err)
            })
            .catch(err => {
                reject(err)    
            })
    })
}

export const setSettings = () => (dispatch) => {
    return new Promise((resolve, reject) => {
        api.get('/settings')
            .then((res) => {
                dispatch({
                    type: GET_INITIALDATA,
                    payload: res.data,
                })
                return resolve(res)
            }, (err) => {
                reject(err)
            })
            .catch(err => {
                reject(err)    
            })
    })
}

export const getServices = () => (dispatch, getState) => { 
    if(!getState().data.services){
        api.get('/services')
            .then(res => {
                dispatch({
                    type: GET_SERVICES,
                    payload: res.data
                })
            }, err => {
                
            })
            .catch(err => {
                
            })
    }
}

export const getAvaiableDates = (startHour, endHour, interval) => (dispatch, getState) => { 
    
    api({
        method: 'get',
        url: '/available-hours',
        param: {
            start_hour: startHour,
            end_hour: endHour,
            interval: interval
        },
    })
        .then(res => { 
            dispatch({
                type: GET_AVAIABLE_DATES,
                payload: res.data
            })
        }, err => {
            
        })
        .catch(err => {
            
        })
}