import React, { SetStateAction } from 'react';
import {Button, Divider, Spin} from 'antd';

import DataList from './DataList';
import {useDatabaseTableContext} from './DatabaseTable';
import {appointmentModel, getData} from '../util/data';
import {api} from '../util/util';
import { useHistory } from 'react-router';
import ModalConfirmation from './ModalConfirmation';

// type
import { OnSaveFunc } from './DataList'
import { IAppointmentDoc, IUserDoc, IUsersIDAPI } from '../interfaces'

// TODO: Move user doc fetching to AppointmentsDetails. Changing user for appointment doesn't change go to user action.

interface IAppointmentsDetails {
    doc: IAppointmentDoc,
    setVisible: React.Dispatch<SetStateAction<boolean>>,
}

const AppointmentsDetails = (props: IAppointmentsDetails) => {
    const {doc, setVisible} = props

    return (
        <div>
            <AppointmentData
                docId={doc.id}
                docData={doc}
                setVisible={setVisible}
            />
            <AppointmentActions
                docData={doc}
                setVisible={setVisible}
            />
        </div>
    )
}

export default AppointmentsDetails

interface IAppointmentData {
    docId: string,
    docData: IAppointmentDoc,
    setVisible: React.Dispatch<SetStateAction<boolean>>,
}

const AppointmentData = (props: IAppointmentData) => {
    const {docId} = props
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
        setdocData(props.docData)    
    },[props.docData])

    const [docData, setdocData] = React.useState(props.docData)
    const listData = React.useMemo(() => getData<IAppointmentDoc>(appointmentModel, docData, {
        email: {disabled: true}
    }), [docData])

    const OnSave: OnSaveFunc<IAppointmentDoc> = (values, callbackRes, callbackErr) => {
        
        const formatedData = {...values}
        // formatedData.duration = parseInt(formatedData.duration)

        api.put(`/appointments/${docId}`, {
            appointment: formatedData
        })
        .then(() => {
            setdocData(formatedData)
            setNeedUpdate(true)
            if (callbackRes) callbackRes()
        })
        .catch(err => {
            if (callbackErr && err.response.data.errors) callbackErr(err.response.data.errors)
        })
    }
        return (
        // TODO: Validation of appointment's Date/Duration need to be more flexible. Since there is connection between these two some additional mechanism is needed to clear errors on one after other is changed. E.g. appointment date might be ok if duration will be shorten.

        <DataList<IAppointmentDoc> 
            data={listData}
            label="Apointment's data"
            onSave={OnSave}
        />
    )
}

interface IAppointmentActions {
    docData: IAppointmentDoc,
    setVisible: React.Dispatch<SetStateAction<boolean>>,
}

const AppointmentActions = (props: IAppointmentActions) => {
    const {docData: doc, setVisible} = props
    const history = useHistory()
    const databaseTableContext = useDatabaseTableContext()
    const updateTableContent = databaseTableContext?.updateTableContent
    
    const [loading, setLoading] = React.useState(true)
    const [userDoc, setUserDoc] = React.useState<IUserDoc | null>(null)
    
    React.useEffect(() => {
        api.get<IUsersIDAPI>(`/users/${doc.user}`)
            .then(res => {
                setUserDoc(res.data.doc)
                setLoading(false)
            })
            .catch(err => {
                // setUserDoc(doc.user)
                setLoading(false)
            })
    },[doc.user])

    const [submitModalVisible, setSubmitModalVisible] = React.useState(false);

    const submitModal = !submitModalVisible ? null :
        <ModalConfirmation 
            visibilityState={[submitModalVisible, setSubmitModalVisible]}
            title={"Deleting appointment"}
            contentInit={<span>"Are you sure?"</span>}
            contentResolved={<span>"Appointment deleted successfully."</span>}
            contentRejected={<p>Something went wrong<br/>Appointment not deleted.</p>}
            onConfirm={() => {
                return new Promise((resolve, reject) => {
                    api.delete(`/appointments/${doc.id}`)  
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
            <Divider orientation="left">Appointment's actions</Divider>
                <Spin spinning={loading}>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                    }}>
                    <Button 
                        style={btnStyle}
                        disabled={!userDoc}
                        onClick={() => {history.push(`/admin/users?filter=%7B"id__icontains"%3A"${doc.user}"%7D&page=1&showRow=0`)}}>
                            {loading ? ' ' :
                                `Go to user ${userDoc ? (userDoc.data.lname + ' ' + userDoc.data.fname) : doc.user}`
                            }
                    </Button>
                    <Button
                        style={btnStyle}
                        onClick={() => {
                            setSubmitModalVisible(true) 
                        }}
                    >
                        {loading ? ' ' :
                            `Delete appointment`
                        }
                    </Button>
                </div>
                </Spin>
                {submitModal}
        </>
    )
}