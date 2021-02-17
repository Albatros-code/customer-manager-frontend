import {
    GET_SERVICES,
    GET_AVAIABLE_DATES,
} from '../types'

import { api } from '../../util/util'

export const getServices = () => (dispatch, getState) => { 
    if(!getState().data.services){
        console.log("fetching /services")
        api.get('/services')
            .then(res => {
                dispatch({
                    type: GET_SERVICES,
                    payload: res.data
                })
            }, err => {
                console.log("err:")
                console.log(err)
            })
            .catch(err => {
                console.log("catch err:")
                console.log(err.response.data)
            })
    }
}

export const getAvaiableDates = (startHour, endHour, interval) => (dispatch, getState) => { 
    console.log("fetching /available-dates")
    api({
        method: 'post',
        url: '/available-dates',
        data: {
            start_hour: startHour,
            end_hour: endHour,
            interval: interval
        },
        // withCredentials: true
    })
        .then(res => { 
            dispatch({
                type: GET_AVAIABLE_DATES,
                payload: res.data
            })
        }, err => {
            console.log("err:")
            console.log(err)
            console.log(err.response)
        })
        .catch(err => {
            console.log("catch err:")
            console.log(err.response.data)
        })
}