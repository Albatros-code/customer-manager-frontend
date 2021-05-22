import React from 'react';
import {Divider} from 'antd';
import {useHistory} from 'react-router-dom'

import DataList from '../components/DataList';
import DatabaseTable, {useDatabaseTableContext} from './DatabaseTable';
import {user as userModel, getData} from '../util/data';
import {api} from '../util/util';
import {dayjsExtended as dayjs} from '../util/util'

const UserDetails = (props) => {
    const {userDoc} = props
    // const {getData} = prop

    return (
        <div>
            <UserData
                userId={userDoc.id}
                userData={userDoc.data}
            />
            <UserAppointments 
                userId={userDoc.id}
            />
        </div>
    )
}

export default UserDetails



const UserData = (props) => {
    const {userId} = props
    const {updateTableContent} = useDatabaseTableContext()
    
    const [needUpdate, setNeedUpdate] = React.useState(false)
    
    React.useEffect(() => {
        return (() => {
            if (needUpdate && updateTableContent) {
                updateTableContent()
            }            
        })
    }, [needUpdate, updateTableContent])

    React.useEffect(() => {
        // console.log('effect')
        setUserData(props.userData)
    },[props.userData])

    const [userData, setUserData] = React.useState(props.userData)

    const listData = getData(userModel.data, userData, {
        email: {disabled: true}
    })

    const OnSave = (values, callbackRes, callbackErr) => {
        const formatedData = {...values}
        formatedData.fname = formatedData.fname.charAt(0).toUpperCase() + formatedData.fname.slice(1).toLowerCase()

        api.put(`/users/${userId}`, {
            user: {
                id: userId,
                data: formatedData
            }
        })
        .then(() => {
            setUserData(formatedData)
            setNeedUpdate(true)
            if (callbackRes) callbackRes()
        })
        .catch(err => {
            if (callbackErr) callbackErr(err.response.data.errors.data)
        })
    }
        return (
        
        <DataList 
            data={listData}
            label='User data'
            onSave={OnSave}
        />
    )
}

const UserAppointments = (props) => {
    const {userId} = props
    const history = useHistory()

    const columns = () => [
        { 
            title: "Service",
            dataIndex: ["service"],
            key: "service",
            ellipsis: true,
        },
        {
            title: "Day",
            dataIndex: ["day"],
            render: (text, record, index) => dayjs(record.date).tz().format('DD-MM-YYYY'),
            key: "day",
            width: 110,
        },
        {
            title: "Time",
            dataIndex: ["time"],
            render: (text, record, index) => dayjs(record.date).tz().format('HH:mm'),
            key: "time",
            width: 80,
        },
    ]

    return (
        <div>
            <Divider orientation="left">User appoinments</Divider>
            <DatabaseTable 
                columns={columns}
                dataUrl={`/users/${userId}/appointments`}
                itemDetails={(record) => {history.push(`/admin/appointments?filter=%7B"id__icontains"%3A"${record.id}"%7D&page=1&showRow=0`)}}
            />

        </div>
    )
}