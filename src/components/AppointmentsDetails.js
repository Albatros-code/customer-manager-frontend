import React from 'react';
import {Button, Divider, Spin} from 'antd';

import DataList from './DataList';
import {useDatabaseTableContext} from './DatabaseTable';
import {appointmentModel, getData} from '../util/data';
import {api} from '../util/util';
import { useHistory } from 'react-router';
import ModalConfirmation from '../components/ModalConfirmation';


const AppointmentsDetails = (props) => {
    const {doc, setVisible} = props

    return (
        <div>
            <ApointmentsData
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



const ApointmentsData = (props) => {
    const {docId} = props
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
        setdocData(props.docData)    
    },[props.docData])

    const [docData, setdocData] = React.useState(props.docData)
    const listData = React.useMemo(() => getData(appointmentModel, docData, {
        email: {disabled: true}
    }), [docData])

    const OnSave = (values, callbackRes, callbackErr) => {
        
        const formatedData = {...values}
        formatedData.duration = parseInt(formatedData.duration)

        api.put(`/appointments/${docId}`, {
            appointment: formatedData
        })
        .then(() => {
            setdocData(formatedData)
            setNeedUpdate(true)
            if (callbackRes) callbackRes()
        })
        .catch(err => {
            // console.log(err.response)
            if (callbackErr && err.response.data.errors) callbackErr(err.response.data.errors)
        })
    }
        return (
        
        <DataList 
            data={listData}
            label="Apointment's data"
            onSave={OnSave}
        />
    )
}

const AppointmentActions = (props) => {
    const {docData: doc, setVisible} = props
    const history = useHistory()
    const {updateTableContent} = useDatabaseTableContext()
    
    const [loading, setLoading] = React.useState(true)
    const [userDoc, setUserDoc] = React.useState(null)
    
    React.useEffect(() => {
        api.get(`/users/${doc.user}`)
            .then(res => {
                setUserDoc(res.data.doc)
                setLoading(false)
            })
    },[doc.user])

    const [submitModalVisible, setSubmitModalVisible] = React.useState(false);

    const submitModal = !submitModalVisible ? null :
        <ModalConfirmation 
            visibilityState={[submitModalVisible, setSubmitModalVisible]}
            title={"Deleting appointment"}
            contentInit={"Are you sure?"}
            contentResolved={"Appointment deleted successfully."}
            contentRejected={<p>Something went wrong<br/>Appointment not scheduled.</p>}
            onConfirm={() => {
                return new Promise((resolve, reject) => {
                    api.delete(`/appointments/${doc.id}`)  
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
                        onClick={() => {history.push(`/admin/users?filter=%7B"id__icontains"%3A"${doc.user}"%7D&page=1&showRow=0`)}}>
                            {loading ? ' ' :
                                `Go to user ${userDoc ? (userDoc.data.lname + ' ' + userDoc.data.fname) : null}`
                            }
                    </Button>
                    <Button
                        style={btnStyle}
                        onClick={() => {
                            setSubmitModalVisible(true)
                            // api.delete(`/appointments/${doc.id}`)  
                            //     .then(res => {
                            //         setVisible(false)
                            //         updateTableContent()
                            //     })  
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