import React from 'react';

import DataList from './DataList';
import {useDatabaseTableContext} from './DatabaseTable';
import {appointmentModel, getData} from '../util/data';
import {api} from '../util/util';

const AppointmentsDetails = (props) => {
    const {doc} = props
    // const {getData} = prop

    return (
        <div>
            <ApointmentsData
                docId={doc.id}
                docData={doc}
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
        // console.log('effect')
        setdocData(props.docData)    
    },[props.docData])

    const [docData, setdocData] = React.useState(props.docData)
    const listData = getData(appointmentModel, docData, {
        email: {disabled: true}
    })

    const OnSave = (values, callbackRes, callbackErr) => {
        console.log(values)
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
            label='Apointments data'
            onSave={OnSave}
        />
    )
}