import React from 'react';
import {useParams} from 'react-router-dom';
import { connect } from 'react-redux';
import {Spin, Alert} from 'antd';

import { setUser } from '../redux/actions/userActions';

import DataList from '../components/DataList';
import {user, getData} from '../util/data';
import {api} from '../util/util';


const Profile = (props) => {
    
    const {userId} = useParams()
    const [userData, setUserData] = React.useState(userId ? {} : props.userData)

    function getUserData(userId){
        api.get(`/users/${userId}`)
        .then(res =>{
            setUserData(res.data.user.data)
        }, err => {
            setUserData({error: 'No user found.'})
            // history.push('/users')
        })
        .catch(err =>{

        })
    }

    React.useEffect(() => {

        if (userId){
            getUserData(userId)
        } else {
            setUserData(props.userData)
        }
        
    }, [userId, setUserData, props.userData])
    
    const id = userId ? userId: props.id
    const role = props.role
    
    const personalData = getData(user.data, userData, {
        email: {disabled: true}
    })

    const personalDataOnSave = (values, callbackRes, callbackErr) => {
        const formatedData = {...values}
        formatedData.fname = formatedData.fname.charAt(0).toUpperCase() + formatedData.fname.slice(1).toLowerCase()

        api.put(`/users/${id}`, {
            user: {
                id: id,
                // user_data: JSON.stringify(formatedData)
                data: formatedData
            }
        // })
        }, {withCredentials: true})
        .then(() => {
            if (!userId){
                props.setUser(id, role).finally(() => {
                    setUserData(formatedData)
                    if (callbackRes) callbackRes()
                })
            } else {
                setUserData(formatedData)
                if (callbackRes) callbackRes()
            }
        })
        .catch(err => {
            // console.log(err.response.data)
            if (callbackErr) callbackErr(err.response.data.errors.data)
        })
    }

    const noUserFoundAlert = userData.hasOwnProperty('error') ?
        <Alert className="data-list-alert-bar" message={userData.error} type="error" showIcon />
        : null

    return (
        <>
            <h1>{userId ? `User profile` : 'My profile'}</h1>
            {noUserFoundAlert}
            <Spin spinning={Object.keys(userData).length === 0}>
                <DataList 
                    data={personalData}
                    label='Personal data'
                    onSave={personalDataOnSave}
                />
            </Spin>
            {/* <DataList 
                data={settingsData}
                label='Settings'
            /> */}
        </>
    )
}


const mapStateToProps = (state) => ({
    id: state.user.id,
    role: state.user.role,
    userData: state.user.data,
})

const mapDispatchToProps = {
    setUser,
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile)