import React from "react";
import { connect } from "react-redux";
import {useParams, useHistory} from 'react-router-dom';

import DatabaseTable from "../components/DatabaseTable";
import {dayjsExtended as dayjs} from '../util/util'

const AdminAppointments = (props) => {
    const history = useHistory()
    const {itemId} = useParams()
    
    const columns = (searchProps) => [
        {
            title: 'Service',
            dataIndex: ['service'],
            sorter: true,
            ellipsis: true,
            filteredValue: itemId ? [''] : null,
            ...searchProps(['service']),
        },
        {
            title: 'Day',
            dataIndex: ['day'],
            sorter: true,
            ellipsis: true,
            width: 110,
            render: (text, record, index) => dayjs(record.date).tz().format('DD-MM-YYYY'),
            filteredValue: itemId ? [''] : null,
            ...searchProps(['date']),
        },
        {
            title: 'Time',
            dataIndex: ['time'],
            ellipsis: true,
            width: 110,
            render: (text, record, index) => dayjs(record.date).tz().format('HH:mm'),
            ...searchProps(['date']),
        },
    ]

    const itemDetails = (record, setVisible) => {
        if (!record) return null

        return (
            <>
                <h2>{record.service} on {dayjs(record.date).tz().format('DD-MM-YYYY')}</h2>
                <p>Appointment details</p>
                <p><strong>User: </strong><button onClick={() => {history.push(`/admin/users/${record.user}`)}}>{record.user}</button></p>
            </>
        )
    } 

    return (
        <>
            <h1>Appointments</h1>
            <DatabaseTable 
                columns={columns}
                dataUrl={'/appointments'}
                itemDetails={itemDetails}
                defaultItemSelected={itemId}
            />
        </>
    )
}

const mapStateToProps = (state) => ({
})

const mapDispatchToProps = {
    
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminAppointments)