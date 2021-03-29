import React from 'react';
import {dayjsExtended as dayjs} from '../util/util'
import {connect} from 'react-redux';
import {useHistory} from 'react-router-dom'

import { api } from '../util/util';
import { Table, Button } from 'antd';
const {Column} = Table;


const Appointments = (props) => {
    
    const {id} = props
    const history = useHistory()
    const [appointments, setAppointments] = React.useState(null)

    React.useEffect(() => {
        api.get(`/users/${id}/appointments`)
            .then(res => {
                // console.log(res.data)
                setAppointments(res.data)
            }, err => {
                console.log(err)
            })
            .catch(err => {
                console.log(err)
            })
    },[id])

    const data = appointments ? appointments.map((item, index) => {
        let date = dayjs(item.date).tz()

        return ({
            key: index,
            service: item.service,
            // day: date.format('DD-MM-YYYY'),
            day: date,
            time: date.format('HH:mm'),
        })
    }) : null

    const lastRow = () => {
        let lastRow = null
        data.forEach(item => {
            if (item.day.isAfter(dayjs.tz())){
                if (lastRow === null || item.day.isBefore(lastRow)){
                    lastRow = dayjs(item.day)
                }
            }
        })
        return lastRow
    }

    return (
        <>
            <div className="page-title">
                <h1>Appointments</h1>
                <Button className="page-title-button" type="primary" danger
                    onClick={() => {history.push('/new-appointment')}}
                >New</Button>
            </div>
            {appointments ? 
            <Table 
                className="appointments-table"
                pagination={{hideOnSinglePage: true}}
                // columns={columns}
                rowClassName={(record, index) => {
                    let className = ''
                    if (record.day.isAfter(dayjs.tz())){
                        className += 'table-row'
                    }                    
                    if (lastRow() && lastRow().isSame(record.day)){
                        className += ' table-row-last'
                    }
                    return className

                }}
                dataSource={data}>
                    <Column 
                        title="Service"
                        dataIndex="service"
                        key="service"
                    />
                    <Column
                        title="Day"
                        dataIndex="day"
                        key="day"
                        width={110}
                        render={
                        (day) => {
                            return (
                                <>
                                    {day.format('DD-MM-YYYY')}
                                    {
                                        day.isAfter(dayjs.tz()) ?
                                        // <div className='additional-div'>upcoming {dayjs(day).fromNow()}</div>
                                        <div className='additional-div'>upcoming soon</div>
                                        : null
                                    }
                                </>
                            )
                        }
                    }/>
                    <Column
                        title="Time"
                        dataIndex="time"
                        key="time"
                        width={80}
                    />

            </Table>
            : null}
        </>
    )
}

const mapStateToProps = (state) => ({
    id: state.user.id,
})
  
  const mapDispatchToProps = {}

export default  connect(mapStateToProps, mapDispatchToProps)(Appointments)