import React from 'react';
// import {useParams} from 'react-router-dom';
import {Spin, Alert} from 'antd';

// redux
import { useAppDispatch, useAppSelector } from '../redux/store';
import { selectUser, setUser } from '../redux/slices/userSlice';

import DataList from '../components/DataList';
import {user as userModel, getData} from '../util/data';
import {api} from '../util/util';

// types
import { IUsersIDAPI } from '../interfaces';
import { IDataList } from '../components/DataList';

const Profile = () => {

    const { role: reduxRole, id: reduxId, data: reduxUserData} = useAppSelector(selectUser)
    const dispatch = useAppDispatch()

    const [userData, setUserData] = React.useState<IUsersIDAPI['doc']['data'] | {error: string} | {}>(reduxUserData)

    React.useEffect(() => {
        setUserData(reduxUserData)
    }, [reduxUserData])
    
    const id = reduxId
    const role = reduxRole
    
    const personalData = getData(userModel.data, userData, {
        email: {disabled: true}
    })

    // const personalDataOnSave:IOnSave<IUsersIDAPI['doc']['data']> = (values, callbackRes, callbackErr) => {
    const personalDataOnSave:IDataList<IUsersIDAPI>['onSave'] = (values, callbackRes, callbackErr) => {
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
        </>
    )
}

export default Profile