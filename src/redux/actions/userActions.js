import jwt_decode from "jwt-decode";

import {
    SET_AUTHENTICATED,
    SET_UNAUTHENTICATED,
    SET_USER,
    // CLEAR_USER_DATA,
    // CLEAR_USER_CREDENTIALS,
    // LOADING_UI,
    // STOP_LOADING_UI,
    // SET_ERRORS,
    // GET_STORED_LISTS,
    // CLEAR_ERRORS
    //LOGIN_USER,
    //LOGOUT_USER,
    //LOADING_USER
} from '../types'

import { api } from '../../util/util'

export const afterLoginAction = (res) => async (dispatch) => {
    // set common authorization header for api calls
    const token = `Bearer ${res.data.access_token}`
    api.defaults.headers.common['Authorization'] = token
    // set user
    const { sub: { id, role } } = jwt_decode(token)
    
    await dispatch(setUser(id, role));
    dispatch({
        type: SET_AUTHENTICATED
    });   
}

export const loginUser = (username, password, remember, history) => (dispatch) => {
    // Input validation

    let MyPromise = new Promise(function(myResolve, myReject) {

    // Call login api
    api.post('/login', {
        username: username,
        password: password,
        remember: remember,
    }, {withCredentials: true})
    .then(res => {
        dispatch(afterLoginAction(res)).then(() => {
            myResolve("resolved successfully")
        })
    }, err => {
        myReject(err)
    })
    .catch(err => {
    })

    })
    return MyPromise
}

export const logoutUserAction = () => (dispatch) => {
    dispatch({
        type: SET_UNAUTHENTICATED
    });
}

export const logoutUser = (onResolve, onReject) => (dispatch) => {
    delete api.defaults.headers.common["Authorization"]
    api.post('/logout/refresh', {}, {withCredentials: true})
        .then(res => {
            dispatch({
                type: SET_UNAUTHENTICATED
            });
            if (onResolve) onResolve()
        }, err => {
            if (onReject) onReject()
        })
    
}

export const setAuthenticated = () => ({
    type: SET_AUTHENTICATED
})

export const setUser = (id, role) => async (dispatch) => {

    const promise = new Promise((resolve, reject) => {
        
        api.get(`/users/${id}`)
            .then(res => {
                dispatch({
                    type: SET_USER,
                    payload: {
                        id: id,
                        role: role,
                        data: res.data.user.data,
                        settings: res.data.user.settings,
                    }
                })
                resolve("resolved")
            }, err => { 
                reject('rejected')
            })
            .catch(err => {
                reject('rejected')
            })

    })

    return promise

}