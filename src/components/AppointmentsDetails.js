import React from 'react';
import {Button, Divider} from 'antd';

import DataList from './DataList';
import {useDatabaseTableContext} from './DatabaseTable';
import {appointmentModel, getData} from '../util/data';
import {api} from '../util/util';
import { useHistory } from 'react-router';


const AppointmentsDetails = (props) => {
    const {doc} = props
    const history = useHistory()
    // const {getData} = prop

    return (
        <div>
            <ApointmentsData
                docId={doc.id}
                docData={doc}
            />
            
            <Divider orientation="left">Appointment's actions</Divider>
            <p><strong>Go to user: </strong><Button onClick={() => {history.push(`/admin/users?filter=%7B"id__icontains"%3A"${doc.user}"%7D&page=1&showRow=0`)}}>{doc.user}</Button></p>
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
        // console.log('effect')
        setdocData(props.docData)    
    },[props.docData])

    const [docData, setdocData] = React.useState(props.docData)
    const listData = getData(appointmentModel, docData, {
        email: {disabled: true}
    })

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
            console.log(err.response)
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