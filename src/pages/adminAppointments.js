import React from 'react';
import { Spin, Form } from 'antd';

// redux
import { connect } from 'react-redux';
import { getServices } from '../redux/actions/dataActions';

import { api, dayjsExtended as dayjs } from '../util/util'
import { generateTimeTableBase, currentWeekString } from '../util/appointments'

import FormWrapper from '../components/FormWrapper';
import DaySelector from '../components/DaySelector';
import WeekSelector from '../components/WeekSelector';


const AdminAppointments = (props) => {

    const rowHeight = 100

    const {services} = props
    const {getServices} = props

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
    
    React.useEffect(() => {
        getServices()
    // eslint-disable-next-line react-hooks/exhaustive-deps  
    }, []) 

    React.useEffect(() => {
        function getAppointments(startDate, endDate){
            api.get('/appointments', {
                params: {
                    start_date: startDate,
                    end_date: endDate,
            }})
                .then(res => {
                    setAppointmentsData((prev) => ({...prev, [res.data.date_range]: res.data.appointments}))
                }, err => {})
                .catch(err => {})
        }

        const startDate = selectedDate.startOf('week')
        const endDate = selectedDate.endOf('week')
        if (!appointmentsData.hasOwnProperty(`${startDate.format('YYYY-MM-DD')}:${endDate.format('YYYY-MM-DD')}`)){ 
            getAppointments(startDate.toISOString(), endDate.toISOString())
        }
    },[appointmentsData, selectedDate])


    const appointmentsCards = appointments.map((item, index) => {
        const date = dayjs(item.date)
        const service = services.find(s => s.name === item.service)
        return (
            <div
                key={'appointment' + index} 
                style={{
                    position: 'absolute',
                    // background: 'red',
                    top: `${((parseInt(date.format('HH')) - 12) + parseInt(date.format('mm'))/60)  * rowHeight}px`,
                    right: '0',
                    width: 'calc(100% - 40px)',
                    // width: '85%',
                    height: `${item.duration/60 * rowHeight}px`,
                    textAlign: 'center',
                    padding: '3px',
            }}>
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        background: 'white',
                        border: '1px solid #1890ff',
                        borderRadius: '3px',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'stretch',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            // borderRight: '1px solid #1890ff',
                            background: '#e6f7ff',
                            width: '50px',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {date.format('HH:mm')}
                    </div>
                    <div
                        style={{
                            width: '100%',
                        }}
                    >
                        {service.name}
                    </div>
                </div>
            </div>
        )
    })

    const timeTable = <div style={{marginBottom: '1rem'}}>
        {generateTimeTableBase(selectedDate, 12, 20, 15)
        .map((item, index) => {
            item.minutes.pop()

            return (
                    <div
                        style={{
                            background: 'white',
                            color: '#d9d9d9',
                            borderBottom: '1px solid #d9d9d9',
                            height: rowHeight + 'px',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                        key={'timeTable' + index}
                    >
                        {item.hour.format('HH')}
                        <div
                            style={{
                                background: 'white',
                                // borderBottom: '1px solid #d9d9d9',
                                height: '100%',
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-end',
                                justifyContent: 'flex-start',

                            }}>{
                            item.minutes.map((minute) => {

                                return (
                                    <div
                                        key={minute}
                                        style={{
                                            background: 'white',
                                            borderBottom: '1px solid #d9d9d9',
                                            height: `${100/(item.minutes.length + 1)}%`,
                                            width: 'calc(100% - 10px)',
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}>
                                            {/* {item} */}
                                    </div>
                                )
                            })
                            }
                        </div>

                    </div>
                )
        })}
    </div>

    const [form] = Form.useForm()
    
    const handleDayChange = (newWeekDay) => {
        setSelectedDate(prev => prev.weekday(newWeekDay))
    }

    const handleWeekChange = (dayObj) => {
        setSelectedDate(dayObj)
        form.setFieldsValue({"day": null})
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

    return (
        <>
            <h1>Appointments</h1>
            <p>selectedDate: {selectedDate.format("YYYY-MM-DD")}</p>
            <FormWrapper
                form={form}
                initialValues={{ day: selectedDate.weekday()}}
            >
                {weekSelector}
                {daySelector}
            </FormWrapper>

            <Spin spinning={!appointments}>
                <div style={{
                    position: 'relative'
                }}>
                    {timeTable}
                    {appointmentsCards}
                </div>
            </Spin>
        </>
    )
}

const ScheduleTable = (props) => {

    return (
        <div style={{
            position: 'relative'
        }}>
            {props.children}
        </div>
    )
}

const mapStateToProps = (state) => ({
    services: state.data.services,
})

const mapDispatchToProps = {
    getServices,
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminAppointments)
