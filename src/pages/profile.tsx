import React from 'react';
// import {useParams} from 'react-router-dom';
import { Spin } from 'antd';

// redux
import { useAppDispatch, useAppSelector } from '../redux/store';
import { selectUser, setUser } from '../redux/slices/userSlice';

import DataList from '../components/DataList';
import {user as userModel, getData} from '../util/data';
import {api} from '../util/util';

// types
import { IUserDataDoc } from '../interfaces';
import { OnSaveFunc } from '../components/DataList';

const Profile = () => {

    const { role: reduxRole, id: reduxId, data: reduxUserData} = useAppSelector(selectUser)
    const dispatch = useAppDispatch()

    const [userData, setUserData] = React.useState<IUserDataDoc | undefined>(reduxUserData)

    React.useEffect(() => {
        setUserData(reduxUserData)
    }, [reduxUserData])
    
    const id = reduxId
    const role = reduxRole
    
    const personalData = getData(userModel.data, userData, {
        email: {disabled: true}
    })

    // const personalDataOnSave:IOnSave<IUsersIDAPI['doc']['data']> = (values, callbackRes, callbackErr) => {
    const personalDataOnSave:OnSaveFunc<IUserDataDoc> = (values, callbackRes, callbackErr) => {
        const formatedData = {...values}
        formatedData.fname = formatedData.fname.charAt(0).toUpperCase() + formatedData.fname.slice(1).toLowerCase()

        api.put(`/users/${id}`, {
            user: {
                id: id,
                data: formatedData
            }
        }, {withCredentials: true})
        .then(() => {
            if (id && role){
                dispatch(setUser(id, role)).finally(() => {
                    setUserData(formatedData)
                    if (callbackRes) callbackRes()
                })
            }
        })
        .catch(err => {
            if (callbackErr) callbackErr(err.response.data.errors.data)
        })
    }

    return (
        <>
            <h1>{'My profile'}</h1>
            <Spin spinning={typeof userData === 'undefined'}>
                <DataList 
                    data={personalData}
                    label='Personal data'
                    onSave={personalDataOnSave}
                />
            </Spin>
        </>
    )
}

export default Profile