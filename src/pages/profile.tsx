import React from 'react';
// import {useParams} from 'react-router-dom';
import {Spin, Alert} from 'antd';

// redux
import { useAppDispatch, useAppSelector } from '../redux/store';
import { selectUser, setUser } from '../redux/slices/userSlice';

import DataList from '../components/DataList';
import {user as userModel, getData} from '../util/data';
import {api} from '../util/util';
import { IUsersIDAPI } from '../interfaces';

interface IOnSave<M> {
    (values: M, callbackRes: any, callbackErr:any):void
}


const Profile = () => {

    const { role: reduxRole, id: reduxId, data: reduxUserData} = useAppSelector(selectUser)
    const dispatch = useAppDispatch()
    
    // const {userId} = useParams<{userId: string}>()

    const [userData, setUserData] = React.useState<IUsersIDAPI['doc']['data'] | {error: string} | {}>(reduxUserData)

    // function getUserData(userId: string){
    //     api.get<IUsersIDAPI>(`/users/${userId}`)
    //     .then(res =>{
    //         setUserData(res.data.doc.data)
    //     }, err => {
    //         setUserData({error: 'No user found.'})
    //         // history.push('/users')
    //     })
    //     .catch(err =>{

    //     })
    // }

    React.useEffect(() => {

        // if (userId){
        //     getUserData(userId)
        // } else {
            setUserData(reduxUserData)
        // }
        
    }, [reduxUserData])
    
    const id = reduxId
    const role = reduxRole
    
    const personalData = getData(userModel.data, userData, {
        email: {disabled: true}
    })

    const personalDataOnSave:IOnSave<IUsersIDAPI['doc']['data']> = (values, callbackRes, callbackErr) => {
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
            // if (!userId && id && role){
            if (id && role){
                dispatch(setUser(id, role)).finally(() => {
                    setUserData(formatedData)
                    if (callbackRes) callbackRes()
                })
            }
            // } else {
            //     setUserData(formatedData)
            //     if (callbackRes) callbackRes()
            // }
        })
        .catch(err => {
            // console.log(err.response.data)
            if (callbackErr) callbackErr(err.response.data.errors.data)
        })
    }

    // if (userData.hasOwnProperty('error')) {
    //     const noUserFoundAlert = userData.hasOwnProperty('error') ?
    //     <Alert className="data-list-alert-bar" message={userData.error} type="error" showIcon />
    //     : null
    // }
    // const noUserFoundAlert = userData.hasOwnProperty('error') && Object.keys(userData).length !== 0 ?
    const noUserFoundAlert = typeof userData === 'object' && 'error' in userData ?
        <Alert className="data-list-alert-bar" message={userData.error} type="error" showIcon />
        : null

    return (
        <>
            <h1>{'My profile'}</h1>
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

export default Profile