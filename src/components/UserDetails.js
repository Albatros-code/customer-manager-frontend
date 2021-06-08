import React from 'react';
import {Divider, Button, Spin} from 'antd';
import {useHistory} from 'react-router-dom'
import { useStore } from 'react-redux';

import DataList from '../components/DataList';
import DatabaseTable, {useDatabaseTableContext} from './DatabaseTable';
import {user as userModel, getData} from '../util/data';
import {api} from '../util/util';
import {dayjsExtended as dayjs} from '../util/util'
import ModalConfirmation from '../components/ModalConfirmation';


const UserDetails = (props) => {
    const {userDoc, setVisible} = props

    return (
        <div>
            <UserData
                userId={userDoc.id}
                userData={userDoc.data}
            />
            <UserAppointments 
                userId={userDoc.id}
            />
            <UserActions
                docData={userDoc}
                setVisible={setVisible}
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
    const {data: {services}} = useStore().getState()

    const columns = () => [
        { 
            title: "Service",
            dataIndex: ["service"],
            key: "service",
            ellipsis: true,
            render: (text, record, index) => {
                const serviceDoc = services ? services.find((item) => item.id === record.service) : null
                return serviceDoc ? serviceDoc.name : "deleted " + record.service
            }
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

const UserActions = (props) => {
    const {docData: doc, setVisible} = props
    const {updateTableContent} = useDatabaseTableContext()
    
    const [loading] = React.useState(false)

    const [submitModalVisible, setSubmitModalVisible] = React.useState(false);

    const submitModal = !submitModalVisible ? null :
        <ModalConfirmation 
            visibilityState={[submitModalVisible, setSubmitModalVisible]}
            title={"Deleting user"}
            contentInit={"Are you sure?"}
            contentResolved={"User deleted successfully."}
            contentRejected={<p>Something went wrong<br/>User not deleted.</p>}
            onConfirm={() => {
                return new Promise((resolve, reject) => {
                    api.delete(`/users/${doc.id}`)  
                        .then(res => {
                            return resolve(res)
                        }, err => {
                            return reject(err)
                        })
                        .catch(err => {
                            return reject(err)
                        })
                    })
                }}
            onResolve={
                // () => {setVisible(false)}
                () => {
                    updateTableContent()
                    setVisible(false)
                }
            }
            onReject={
                () => {
                    // console.log('Rejected')
                }
            }
        />
    

    const btnStyle = {
        width: '80%',
        margin: '0.5rem',
    }
    return (
        <>
            <Divider orientation="left">User's actions</Divider>
                <Spin spinning={loading}>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                    }}>
                    {/* <Button 
                        style={btnStyle}
                        onClick={() => {history.push(`/admin/users?filter=%7B"id__icontains"%3A"${doc.user}"%7D&page=1&showRow=0`)}}>
                            {loading ? ' ' :
                                `Go to user ${userDoc ? (userDoc.data.lname + ' ' + userDoc.data.fname) : null}`
                            }
                    </Button> */}
                    <Button
                        style={btnStyle}
                        onClick={() => {
                            setSubmitModalVisible(true)
                        }}
                    >
                        {loading ? ' ' :
                            `Delete user`
                        }
                    </Button>
                </div>
                </Spin>
                {submitModal}
        </>
    )
}