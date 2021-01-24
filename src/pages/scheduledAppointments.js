import React from 'react';
import moment from 'moment';
import { api } from '../util/util';
import { Table } from 'antd';

const ScheduledAppointments = () => {

    const [ appointments, setAppointments ] = React.useState(null)

    React.useEffect(() => {

        // api.get('/appointment', null, {withCredentials: true})
        api.get('/appointment')
            .then(res => {
                console.log(res.data)
                setAppointments(res.data)
            }, err => {
                console.log(err)
            })
            .catch(err => {
                console.log(err)
            })
            

        console.log("featch data")

    },[])

    const columns = [
        {
            title: 'Service',
            dataIndex: 'service',
            key: 'service',
        },
        {
            title: 'Day',
            dataIndex: 'day',
            key: 'day',
        },
        {
            title: 'Time',
            dataIndex: 'time',
            key: 'time',
        },
    ]

    const data = appointments ? appointments.map((item, index) => {
        let date = moment(item.date)
        return ({
            key: index,
            service: item.service,
            day: date.format('DD-MM-YYYY'),
            time: date.format('HH:mm'),
        })
    }) : null
    

    return (
        <>
            <h1>Scheduled Appointments</h1>
            {appointments ? <Table pagination={{hideOnSinglePage: true}} columns={columns} dataSource={data}/> : null}
        </>
    )
}

export default ScheduledAppointments