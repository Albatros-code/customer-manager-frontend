import React from "react";
import jwt_decode from 'jwt-decode';
import {Spin} from 'antd';

import {api} from './util';

// redux
import { useAppDispatch, useAppSelector } from '../redux/store'
import { fetchSettings, fetchServices } from '../redux/slices/dataSlice'
import { afterLoginAction } from '../redux/slices/userSlice'
import { selectUI, stopLoadingUi} from '../redux/slices/uiSlice'

// types
import { IDecodedJWT } from '../interfaces'


const RefreshToken = ( props: any ) => {

    const { loading: loadingUI } = useAppSelector(selectUI)
    const dispatch = useAppDispatch()

    React.useEffect(() => {
        function refreshToken(){
            delete api.defaults.headers.common['Authorization']
    
            return new Promise((resolve, reject) => {
                
                api.post('/token/refresh', '', {withCredentials: true})
                .then(res => {
                    dispatch(afterLoginAction(res))
                        .then(() => {
        
                            const token = `Bearer ${res.data.access_token}`
                            const { iat, exp } = jwt_decode<IDecodedJWT>(token)
                            
                            setTimeout(() => {
                                refreshToken()
                                }, ((exp - iat) * 1000) - 500)
        
                            resolve('resolved')
                        })
                }, err => {
                    reject()          
                })
                .catch(err => {
                    reject()
                })
            })
        }
        
        Promise.allSettled([
            refreshToken(),
            dispatch(fetchSettings()),
            dispatch(fetchServices())
        ]).then((results) => {
            dispatch(stopLoadingUi())
        })
        
    }, [dispatch]);

    return (
        loadingUI ?
                <Spin 
                    size="large"
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translateX(-50%) translateY(-50%)'
                    }}/> 
            : 
                props.children
    );
}

export default RefreshToken
