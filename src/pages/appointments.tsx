import React from 'react';
import {useHistory} from 'react-router-dom'
import { Table, Button, Descriptions, Alert} from 'antd';

import {dayjsExtended as dayjs} from '../util/util'
import { api } from '../util/util';

import {ScheduleItemDetails} from '../components/ScheduleTable'

// redux
import { useAppSelector } from "../redux/store";
import { selectData } from "../redux/slices/dataSlice";
import { selectUser } from "../redux/slices/userSlice";

// types
import { IAppointmentDoc, IGetUsersIDAppointmentsAPI } from '../interfaces';
import { Dayjs } from 'dayjs';
import { ColumnType } from 'antd/lib/table/interface'

const Appointments = () => {
    
    const { services } = useAppSelector(selectData)
    const { id } = useAppSelector(selectUser)

    const history = useHistory()
    const [appointments, setAppointments] = React.useState<IAppointmentDoc[] | undefined>(undefined)
    const [detailsVisible, setDetailsVisible] = React.useState<boolean>(false)
    const [selectedRecord, setSelectedRecord] = React.useState<number | undefined>(undefined)

    React.useEffect(() => {
        api.get<IGetUsersIDAppointmentsAPI>(`/users/${id}/appointments`)
            .then(res => {
                
                setAppointments(res.data.data.sort((a, b) => dayjs(b.date).tz().unix() - dayjs(a.date).tz().unix()))
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
        let lastRow: Dayjs | null = null
        data && data.forEach(item => {
            if (item.dayObj.isAfter(dayjs.tz(dayjs()))){
                if (lastRow === null || item.dayObj.isBefore(lastRow)){
                    lastRow = dayjs(item.dayObj).tz()
                }
            }
        })
        return lastRow as Dayjs | null
    }

    const appointmentDetails = () => (setVisible: React.Dispatch<React.SetStateAction<boolean>>) =>{
        if (selectedRecord === undefined || !data) {
            return null
        } else {
            const appointment = data[selectedRecord].data
    
            const dateObj = dayjs(appointment.date).tz()
    
            const deleteAppointment = () => {
                api.delete(`/appointments/${appointment.id}`)
                    .then(() => {
                        setVisible(false)
                        setAppointments(prev => [...Array.isArray(prev) ? prev : []].filter((item, index) => index !== selectedRecord))
                    })
                    .catch(() => {})
            }
    
            
            const serviceDoc = services ? services.find((item) => item.id === appointment.service) : null
            const serviceName = serviceDoc ? serviceDoc.name : "deleted " + appointment.service
            
            return (
                <div className="schedule-table-appointment-details">
                    <h1>{serviceName}</h1>
    
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
                        <Button disabled={dateObj <= dayjs.tz(dayjs())} onClick={deleteAppointment}>Delete</Button>
                    </p>
                </div>
            )
        }

    }

    const columns: ColumnType<Exclude<typeof data, null>[number]>[] = [
        { 
            title: "Service",
            dataIndex: "service",
            key: "service",
            render: (text, record, index) => {
                const serviceDoc = services ? services.find((item) => item.id === record.service) : null
                return serviceDoc ? serviceDoc.name : "deleted " + record.service
            }
        },
        {
            title: "Day",
            dataIndex: "day",
            key: "day",
            width: 110,
        },
        {
            title: "Time",
            dataIndex: "time",
            key: "time",
            width: 80,
        }
    ]
  
    return (
        <>
            <div className="page-title">
                <h1>Appointments</h1>
                <Button className="page-title-button" type="primary" danger
                    onClick={() => {history.push('/new-appointment')}}
                >New</Button>
            </div>
             {
                appointments && (appointments.filter(item => dayjs(item.date).tz().isAfter(dayjs.tz(dayjs())))).length > 0 ?
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
                            if (record.dayObj.isAfter(dayjs.tz(dayjs()))){
                                className += 'table-row'
                            }
                            const lastRowDate = lastRow()           
                            if (lastRowDate && lastRowDate.isSame(record.day)){
                                className += ' table-row-last'
                            }
                            return className

                        }}
                        dataSource={data ? data : []}
                        onRow={(record, rowIndex) => {
                            return {
                                onClick: () => {setSelectedRecord(rowIndex); setDetailsVisible(true)},
                            };
                        }}
                        columns={columns}
                    />
                    <div>
                        <ScheduleItemDetails 
                            visible={detailsVisible}
                            setVisible={setDetailsVisible}
                            details={appointmentDetails()}
                        />
                    </div>
                </>
            : null}
        </>
    )
}

export default  Appointments