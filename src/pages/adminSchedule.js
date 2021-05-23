import React from 'react';
import { Spin, Form } from 'antd';
// import {UserOutlined, DeleteOutlined, EditOutlined} from '@ant-design/icons';

// redux
import { connect } from 'react-redux';

import { api, dayjsExtended as dayjs } from '../util/util'
import { currentWeekString } from '../util/appointments'

// components
import FormWrapper from '../components/FormWrapper';
import DaySelector from '../components/daySelector';
import WeekSelector from '../components/WeekSelector';
import {ScheduleTable, ScheduleItem} from '../components/ScheduleTable';
import AppointmentsDetails from '../components/AppointmentsDetails';
import {DatabaseTableContext} from '../components/DatabaseTable';


const AdminSchedule = (props) => {

    const {services} = props
    const {settings: {start_hour: startHour, end_hour: endHour, time_interval: timeInterval}} = props

    const [ selectedDate, setSelectedDate ] = React.useState(dayjs.tz().set({second: 0, millisecond: 0}))
    const [ appointmentsData, setAppointmentsData ] = React.useState({})
    
    const appointments = (() => {
        if (appointmentsData.hasOwnProperty(currentWeekString(selectedDate))){
            return appointmentsData[currentWeekString(selectedDate)].filter(appointment => {
                const date = dayjs(appointment.date)
                return date.format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD')
            })
        } else {
            return []
        }
    })()

    function getAppointments(startDate, endDate){
        api.get('/appointments-schedule', {
            params: {
                start_date: startDate,
                end_date: endDate,
        }})
            .then(res => {
                setAppointmentsData((prev) => ({...prev, [res.data.date_range]: res.data.appointments}))
            }, err => {})
            .catch(err => {})
    }

    React.useEffect(() => {
        const startDate = selectedDate.startOf('week')
        const endDate = selectedDate.endOf('week')
        if (!appointmentsData.hasOwnProperty(`${startDate.format('YYYY-MM-DD')}:${endDate.format('YYYY-MM-DD')}`)){ 
            getAppointments(startDate.toISOString(), endDate.toISOString())
        }
    },[appointmentsData, selectedDate])

    function getData(){
        const startDate = selectedDate.startOf('week')
        const endDate = selectedDate.endOf('week')
        getAppointments(startDate.toISOString(), endDate.toISOString())
    }

    
    const [form] = Form.useForm()
    
    const handleDayChange = (newWeekDay) => {
        setSelectedDate(prev => prev.weekday(newWeekDay))
    }
    
    const handleWeekChange = (dayObj) => {
        setSelectedDate(dayObj)
        form.setFieldsValue({"day": dayObj.weekday()})
    }
    
    const weekSelector =
    <WeekSelector
        handleWeekChange={handleWeekChange}
        selectedDate={selectedDate}
        disabledButtonLeft={false}
        disabledButtonRight={false}
    />
    
    const daySelector = 
    <DaySelector
        handleDayChange={handleDayChange}
        selectedDate={selectedDate}
        disabledButton={false}
    />

    const appointmentCardContent = (appointment) => {
        return (
            <div className="schedule-table-appointment-card">
                <p>{services.find((item) => item.id === appointment.service).name}</p>
                <p>{appointment.user_name}</p>
                <p>{appointment.phone}</p>
            </div>
        )
    }

    // const appointmentDetails = (appointment) => (setVisible) => {

        // const dateObj = dayjs(appointment.date)
        
        // const deleteAppointment = () => {
        //     api.delete(`/appointments/${appointment.id}`)
        //         .then(res => {
        //             const currentWeek = currentWeekString(selectedDate)
        //             setAppointmentsData((prev) => {
        //                 return delete {...prev}[currentWeek]
        //                 // return prev
        //             })
        //             setVisible(prev => !prev)
        //         })
        // }


    //     return (
    //         <div className="schedule-table-appointment-details">
    //             {/* <h1>{services.find((item) => item.id === appointment.service).name}</h1> */}
    //             <AppointmentsDetails 
    //                 doc={appointment}
    //             />
    //             {/* <Descriptions 
    //                 bordered
    //                 column={1}
    //                 className="schedule-table-appointment-details-list"
    //             >
    //                 <Descriptions.Item label="Date">{dateObj.format("YYYY-MM-DD")}</Descriptions.Item>
    //                 <Descriptions.Item label="Time">{dateObj.format("HH:mm")}</Descriptions.Item>
    //                 <Descriptions.Item label="User">{appointment.user}</Descriptions.Item>
    //                 <Descriptions.Item label="Phone">{appointment.phone}</Descriptions.Item>
    //                 <Descriptions.Item label="Created at">{dateObj.format("YYYY-MM-DD HH:mm")}</Descriptions.Item>
    //             </Descriptions>
    //             <p className="schedule-table-appointment-details-icons">
    //                 <Button disabled={true}>Change date</Button>
    //                 <Button onClick={() => {history.push(`/admin/users/${appointment.user_id}`)}}>Show User</Button>
    //                 <Button onClick={deleteAppointment}>Delete</Button>
    //             </p> */}
    //                 {/* <Button><EditOutlined /></Button><UserOutlined /><DeleteOutlined /></p> */}
    //         </div>
    //     )
    // }

    const itemDetails = (record, setVisible) => {
        if (!record) return null
        const title = (services ? services.find((item) => item.id === record.service).name : null) + ' on ' + dayjs(record.date).tz().format('DD-MM-YYYY')

        return (
            [<>
                <AppointmentsDetails 
                    doc={record}
                />
            </>, title]
        )
    } 
    
    const appointmentCards = appointments.map((item, index) => {
        // const service = services.find(s => s.name === item.service)
        return (
            <ScheduleItem
                date={dayjs(item.date)}
                duration={item.duration}
                key={index}
                record={item}
                // details={appointmentDetails(item)}
                details={itemDetails}
            >
                {appointmentCardContent(item)}
            </ScheduleItem>
        )
    })
    
    return (
        <>
            <h1>Appointments</h1>
            {/* <p>selectedDate: {selectedDate.format("YYYY-MM-DD")}</p> */}
            <FormWrapper
                className="schedule-table-form"
                form={form}
                initialValues={{ day: selectedDate.weekday()}}
            >
                {weekSelector}
                {daySelector}
            </FormWrapper>

            <Spin spinning={ !appointmentsData.hasOwnProperty(currentWeekString(selectedDate)) && appointments.length === 0}>
                <DatabaseTableContext.Provider value={{
                        updateTableContent: getData
                    }}>
                    <ScheduleTable
                        startHour={startHour}
                        endHour={endHour}
                        timeInterval={timeInterval}
                        selectedDate={selectedDate}
                        items={appointmentCards}
                    >
                        {appointmentCards}
                    </ScheduleTable>
                </DatabaseTableContext.Provider>
            </Spin>
        </>
    )
}


const mapStateToProps = (state) => ({
    services: state.data.services,
    settings: state.data.settings,
})

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminSchedule)
