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

export const loginUser = (username, password, history) => (dispatch) => {
    // Input validation

    let MyPromise = new Promise(function(myResolve, myReject) {

    // Call login api
    api.post('/login', {
        username: username,
        password: password
    }, {withCredentials: true})
    .then(res => {
        // set common authorization header for api calls
        const token = `Bearer ${res.data.access_token}`
        api.defaults.headers.common['Authorization'] = token
        // set user
        const { sub: { username, role, data } } = jwt_decode(token)
        
        dispatch(setUser(username, role, data));
        dispatch({
            type: SET_AUTHENTICATED
        });
        myResolve("resolved successfully")
        // redirect to history page
        // const push = location.state ? location.state.from : "/history"
        // history.push(push)
    }, err => {
        myReject(err)
        // set error state in order to validate form fields 
        // setErrors({...err.response.data.errors})
        // form.validateFields()
        //     .catch(() => {
        //         // clear errors and stop loading
        //         setErrors({})
        //         setFormLoading(false)
        //     })
    })
    .catch(err => {
        // console.log('catchError: ' + err)
    })

    })
    return MyPromise
}

export const logoutUser = () => (dispatch) => {
    dispatch({
        type: SET_UNAUTHENTICATED
    });
}

export const setAuthenticated = () => ({
    type: SET_AUTHENTICATED
})

export const setUser = (username, role, data) => ({
    type: SET_USER,
    payload: {
        username: username,
        role: role,
        data: data
    }
})