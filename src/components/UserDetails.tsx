import React from 'react';
import {Divider, Button, Spin} from 'antd';
import {useHistory} from 'react-router-dom'

import DataList from './DataList';
import DatabaseTable, {useDatabaseTableContext} from './DatabaseTable';
import {user as userModel, getData} from '../util/data';
import {api} from '../util/util';
import {dayjsExtended as dayjs} from '../util/util'
import ModalConfirmation from './ModalConfirmation';

// redux
import { selectData } from '../redux/slices/dataSlice';
import { useAppSelector } from '../redux/store';

// types
import { IAppointmentDoc, IUserDataDoc, IUserDoc } from '../interfaces';
import { IDatabaseTable } from '../components/DatabaseTable'
import { OnSaveFunc } from './DataList';

interface IUserDetails {
    doc: IUserDoc,
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
}

const UserDetails = (props: IUserDetails) => {
    const { doc, setVisible } = props
    return (
        <div>
            <UserData
                userId={doc.id}
                userData={doc.data}
            />
            <UserAppointments 
                userId={doc.id}
            />
            <UserActions
                doc={doc}
                setVisible={setVisible}
            />
        </div>
    )
}

export default UserDetails

interface IUserData {
    userId: string
    userData: IUserDataDoc
}

const UserData = (props: IUserData) => {
    const {userId} = props
    const databaseTableContext = useDatabaseTableContext()
    const updateTableContent = databaseTableContext?.updateTableContent
    
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

    const OnSave: OnSaveFunc<IUserDataDoc> = (values, callbackRes, callbackErr) => {
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
        
        <DataList<IUserDataDoc> 
            data={listData}
            label='User data'
            onSave={OnSave}
        />
    )
}

interface IUserAppointments {
    userId: string,
}

const UserAppointments = (props: IUserAppointments) => {
    const {userId} = props
    const history = useHistory()
    
    const { services } = useAppSelector(selectData)

    const columns: IDatabaseTable<IAppointmentDoc>['columns'] = () => [
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
                handleRowClick={(record) => {history.push(`/admin/appointments?filter=%7B"id__icontains"%3A"${record.id}"%7D&page=1&showRow=0`)}}
            />

        </div>
    )
}

interface IUserActions {
    doc: IUserDoc,
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
}

const UserActions = (props: IUserActions) => {
    const {doc, setVisible} = props
    const databaseTableContext = useDatabaseTableContext()
    const updateTableContent = databaseTableContext?.updateTableContent
    
    const [loading] = React.useState(false)

    const [submitModalVisible, setSubmitModalVisible] = React.useState(false);

    const submitModal = !submitModalVisible ? null :
        <ModalConfirmation 
            visibilityState={[submitModalVisible, setSubmitModalVisible]}
            title={"Deleting user"}
            contentInit={<span>"Are you sure?"</span>}
            contentResolved={<span>"User deleted successfully."</span>}
            contentRejected={<p>Something went wrong<br/>User not deleted.</p>}
            onConfirm={() => {
                return new Promise((resolve, reject) => {
                    api.delete(`/users/${doc.id}`)  
                        .then(res => {
                            return resolve()
                        }, err => {
                            return reject(err)
                        })
                        .catch(err => {
                            return reject(err)
                        })
                    })
                }}
            onResolve={
                () => {
                    updateTableContent && updateTableContent()
                    setVisible(false)
                }
            }
            onReject={
                () => {}
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