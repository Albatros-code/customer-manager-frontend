import React from "react";
import jwt_decode from 'jwt-decode';
import { connect } from "react-redux";
import { Spin } from 'antd' 

import { api } from './util'

// redux
import { afterLoginAction } from '../redux/actions/userActions'
import { stopLoadingUi } from '../redux/actions/uiActions'


const RefreshToken = ( props ) => {
  
    const refreshToken = () => {
        delete api.defaults.headers.common['Authorization']

        api.post('/token/refresh', '', {withCredentials: true})
        .then(res => {
            props.afterLoginAction(res)
            // api.defaults.headers.common['Authorization'] = token
            // props.setUser(username, role, res.data.user_data)
            // props.setAuthenticated()

            const token = `Bearer ${res.data.access_token}`
            const { iat, exp } = jwt_decode(token)
            
            setTimeout(() => {
                refreshToken()
                }, ((exp - iat) * 1000) - 500)

        }, err => {
            // console.error("token/refresh - useEffect", err.response.data)            
        })
        .catch(err => {
            // console.log(err)
        })
        .finally(() => {
            props.stopLoadingUi(false)
        })
    }
  
    React.useEffect(() => {
        refreshToken();
        // eslint-disable-next-line
    }, []);

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

const mapDispatchToProps = { afterLoginAction, stopLoadingUi}

export default connect(mapStateToProps, mapDispatchToProps)(RefreshToken)
