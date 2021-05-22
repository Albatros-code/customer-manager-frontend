import React from "react";
import jwt_decode from 'jwt-decode';
import {connect} from "react-redux";
import {Spin} from 'antd';

import {api} from './util';

// redux
import {afterLoginAction} from '../redux/actions/userActions';
import {stopLoadingUi} from '../redux/actions/uiActions';
import {getInitialData, getServices} from '../redux/actions/dataActions';


const RefreshToken = ( props ) => {

    const {afterLoginAction, stopLoadingUi, getInitialData, getServices} = props

    React.useEffect(() => {
        function refreshToken(){
            delete api.defaults.headers.common['Authorization']
    
            return new Promise((resolve, reject) => {
                
                api.post('/token/refresh', '', {withCredentials: true})
                .then(res => {
                    afterLoginAction(res).then(() => {
    
                        const token = `Bearer ${res.data.access_token}`
                        const { iat, exp } = jwt_decode(token)
                        
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
            getInitialData(),
            getServices()
        ]).then((results) => {
            stopLoadingUi(false)
        })
        
    }, [afterLoginAction, getInitialData, stopLoadingUi, getServices]);

    return (
        props.loadingUi ?
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

const mapStateToProps = (state) => ({
    loadingUi: state.ui.loading
})

const mapDispatchToProps = { getInitialData, getServices, afterLoginAction, stopLoadingUi}

export default connect(mapStateToProps, mapDispatchToProps)(RefreshToken)
