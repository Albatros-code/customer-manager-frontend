import React from 'react';
import {connect} from 'react-redux';
import {useHistory} from 'react-router-dom'
import { Table, Button, Descriptions, Alert} from 'antd';

import {dayjsExtended as dayjs} from '../util/util'
import { api } from '../util/util';

import {ScheduleItemDetails} from '../components/ScheduleTable'

const {Column} = Table;

const Appointments = (props) => {
    
    const {id} = props
    const history = useHistory()
    const [appointments, setAppointments] = React.useState(null)
    const [detailsVisible, setDetailsVisible] = React.useState(false)

    React.useEffect(() => {
        api.get(`/users/${id}/appointments`)
            .then(res => {
                
                setAppointments(res.data)
            }, err => {

            })
            .catch(err => {

            })
    },[id])

    const data = appointments ? appointments.map((item, index) => {
        let date = dayjs(item.date).tz()

        return ({
            key: index,
            data: item,
            dayObj: date,

            service: item.service,
            day: date.format('DD-MM-YYYY'),
            time: date.format('HH:mm'),
        })
    }) : null

    const lastRow = () => {
        let lastRow = null
        data.forEach(item => {
            if (item.dayObj.isAfter(dayjs.tz())){
                if (lastRow === null || item.dayObj.isBefore(lastRow)){
                    lastRow = dayjs(item.dayObj).tz()
                }
            }
        })
        return lastRow
    }

    const appointmentDetails = () => (setVisible) =>{
        if (!Number.isInteger(detailsVisible)) return null
        const appointment = data[detailsVisible].data

        const dateObj = dayjs(appointment.date).tz()

        const deleteAppointment = () => {
            api.delete(`/appointment/${appointment.id}`)
                .then(res => {
                    setAppointments(prev => [...prev].filter((item, index) => index !== detailsVisible))
                    setVisible(false)
                })
        }

        return (
            <div className="schedule-table-appointment-details">
                <h1>{appointment.service}</h1>

                <Descriptions 
                    bordered
                    column={1}
                    className="schedule-table-appointment-details-list"
                >
                    <Descriptions.Item label="Date">{dateObj.format("YYYY-MM-DD")}</Descriptions.Item>
                    <Descriptions.Item label="Time">{dateObj.format("HH:mm")}</Descriptions.Item>
                    <Descriptions.Item label="Created at">{dateObj.format("YYYY-MM-DD HH:mm")}</Descriptions.Item>
                </Descriptions>
                <p className="schedule-table-appointment-details-icons">
                    <Button disabled={true}>Change date</Button>
                    <Button disabled={dateObj <= dayjs.tz()} onClick={deleteAppointment}>Delete</Button>
                </p>
            </div>
        )
    }
  
    return (
        <>
            <div className="page-title">
                <h1>Appointments</h1>
                <Button className="page-title-button" type="primary" danger
                    onClick={() => {history.push('/new-appointment')}}
                >New</Button>
            </div>
             {
                appointments && (appointments.filter(item => dayjs(item.date).tz().isAfter(dayjs.tz()))).length > 0 ?
                <Alert className="appointments-upcomming-alert" message="You have upcoming appointments!" type="success" closable afterClose={() => {}} />
                : null
            }
            {appointments ? 
                <>
                    <Table 
                        className="appointments-table"
                        pagination={{
                            hideOnSinglePage: true,
                            pageSize: 20,
                        }}
                        rowClassName={(record, index) => {
                            let className = ''
                            if (record.dayObj.isAfter(dayjs.tz())){
                                className += 'table-row'
                            }                    
                            if (lastRow() && lastRow().isSame(record.day)){
                                className += ' table-row-last'
                            }
                            return className

                        }}
                        dataSource={data}
                        onRow={(record, rowIndex) => {
                            return {
                                onClick: () => {setDetailsVisible(rowIndex)},
                            };
                        }}
                        >
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
                            />
                            <Column
                                title="Time"
                                dataIndex="time"
                                key="time"
                                width={80}
                            />

                    </Table>
                    <div>
                        <ScheduleItemDetails 
                            visible={Number.isInteger(detailsVisible)}
                            setVisible={setDetailsVisible}
                            details={appointmentDetails()}
                        />
                    </div>
                </>
            : null}
        </>
    )
}

const mapStateToProps = (state) => ({
    id: state.user.id,
})
  
  const mapDispatchToProps = {}

export default  connect(mapStateToProps, mapDispatchToProps)(Appointments)