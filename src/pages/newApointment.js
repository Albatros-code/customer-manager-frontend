import React from 'react';
import {useHistory} from 'react-router-dom';

import {dayjsExtended as dayjs} from '../util/util'

import { Form, Button, Divider, Spin, Descriptions} from 'antd';

// redux
import { connect } from 'react-redux';
import {getServices} from '../redux/actions/dataActions';
import { api } from '../util/util';

// components
import ModalConfirmation from '../components/ModalConfirmation';
import FormWrapper from '../components/FormWrapper';
import DaySelector from '../components/daySelector';
import ServiceSelector from '../components/ServiceSelector';
import WeekSelector from '../components/WeekSelector';
import HourSelector from '../components/HourSelector';

const NewAppointment = (props) => {
    
    React.useEffect(() => {
        getServices()
        // eslint-disable-next-line react-hooks/exhaustive-deps  
    },[])
    
    const history = useHistory()
    const [form] = Form.useForm();
    
    // from redux
    const {settings: {
        start_hour: startHour,
        end_hour: endHour,
        time_interval: timeInterval,
        working_days: workingDays
    }} = props
    const {getServices} = props
    const {services} = props    
    
    // React.useState
    const [ selectedDate, setSelectedDate ] = React.useState(dayjs.tz().set({second: 0, millisecond: 0}))
    const [ service, setService ] = React.useState(null)
    const [availableSlots, setAvailableSlots] = React.useState({})
    

    const currentAvailableSlots = (() => {
        if (availableSlots.hasOwnProperty(currentWeekString(selectedDate))){
            return availableSlots[currentWeekString(selectedDate)]
        } else {
            return {}
        }
    })()
    
    // useEffect for fetching missing slots availability info
    React.useEffect(() => {
        function getAvailableSlots(startDate, endDate, startHour, endHour, interval, service, setAvailableSlots){
            
            api.get('/available-slots', {
                params: {
                    start_date: startDate,
                    end_date: endDate,
                    start_hour: startHour,
                    end_hour: endHour,
                    interval: interval,
                    service: service
            }})
                .then(res => {
                    setAvailableSlots((prev) => ({...prev, [res.data.date_range]: res.data.slots}))
                })
        }

        const startDate = selectedDate.startOf('week')
        const endDate = selectedDate.endOf('week')
        if (service && !availableSlots.hasOwnProperty(`${startDate.format('YYYY-MM-DD')}:${endDate.format('YYYY-MM-DD')}`)){ 
            getAvailableSlots(startDate.toISOString(), endDate.toISOString(), startHour, endHour, timeInterval, service, setAvailableSlots)
        }
    },[availableSlots, endHour, selectedDate, service, startHour, timeInterval])

    
    function currentWeekString(dayObj, accuracy){
        const startDate = dayObj.startOf('week')
        const endDate = dayObj.endOf('week')

        switch(accuracy) {
            case 'month':
                return `${startDate.format('MM-DD')}:${endDate.format('MM-DD')}`;
            case 'display':
                return `${startDate.format('DD.MM')}-${endDate.format('DD.MM')}`;
            default:
                return `${startDate.format('YYYY-MM-DD')}:${endDate.format('YYYY-MM-DD')}`
          }
        
    }

    const handleServiceChange = (value) => {
        setAvailableSlots({})
        setService(value)
        form.setFieldsValue({
            'day': null,
            'timeHour': null,
            'timeMinutes': null
        })
    }

    const handleWeekChange = (dayObj) => {
        setSelectedDate(dayObj)
        form.setFieldsValue({'day': null, 'timeHour': null, 'timeMinutes': null})
    }

    const handleDayChange = (newWeekDay) => {
        setSelectedDate(prev => prev.weekday(newWeekDay))
        form.setFieldsValue({timeHour: null, timeMinutes: null})
    }

    const handleHourChange = (hour) => {
        const minutes = Object.entries(currentAvailableSlots[selectedDate.format('YYYY-MM-DD')][hour])
            .filter(([key, val]) => val).map(([key]) => key).sort()[0]

        form.setFieldsValue({
            timeMinutes: `${hour}:${minutes}`
        })
        setSelectedDate(prev => prev.set({hour: hour, minute: minutes}))
    }

    const handleMinutesChange = (val) => {
        
        let [ hour, minutes ] = String(val).split(":")

        form.setFieldsValue({
            timeHour: hour
        })
        setSelectedDate(prev => prev.set({hour: hour, minute: minutes}))
    }

    const isAvaiableDay = (timeObj) => {
        const day = timeObj.format('YYYY-MM-DD')

        try {
            for (const minutes of Object.values(currentAvailableSlots[day])){
                if (Object.values(minutes).includes(true)){
                    return true
                }
            }
        } catch {
            return false
        }
        return false
    }

    const isAvaiableHour = (timeObj) => {
        const day = timeObj.format('YYYY-MM-DD')
        const hour = timeObj.format('HH')

        try {
            if (Object.values(currentAvailableSlots[day][hour]).includes(true)){
                return true
            } else {
                return false
            }
        } catch {
            return false
        }
    }
    
    function isAvaiableMinute(timeObj){
        const day = timeObj.format('YYYY-MM-DD')
        const hour = timeObj.format('HH')
        const minutes = timeObj.format('mm')

        try {
            return currentAvailableSlots[day][hour][minutes]
        } catch {
            return false
        }
    }

    const appointmentSummary =(forModal) =>
             <Descriptions 
                bordered
                size="small"
                column={1}
                className={`new-appointment-summary-table ${forModal ? null : 'form-item-padding-bottom'}`}
            >
                <Descriptions.Item label="Service">{service}</Descriptions.Item>
                <Descriptions.Item label="Date">{form.getFieldValue('day') && form.getFieldValue('day') !== null ? selectedDate.format('YYYY-MM-DD') : null}</Descriptions.Item>
                <Descriptions.Item label="Time">{form.getFieldValue('timeMinutes') ? selectedDate.format('HH:mm') : null}</Descriptions.Item>
            </Descriptions>

    // modal

    const [submitModalVisible, setSubmitModalVisible] = React.useState(false);

    const submitModal = 
        <ModalConfirmation 
            visibilityState={[submitModalVisible, setSubmitModalVisible]}
            title={"Scheduling new appointment"}
            contentInit={appointmentSummary(true)}
            contentResolved={"Appointment added successfully."}
            contentRejected={<p>Something went wrong<br/>Appointment not scheduled.</p>}
            onConfirm={() => {
                return new Promise((resolve, reject) => {
                    api.post('/appointments', {
                        service: form.getFieldValue('service'),
                        date: selectedDate.toISOString(),
                        duration: services.find(item => item.name === form.getFieldValue('service')).time,
                    // }, {withCredentials: true})
                    })
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
                () => {history.push('/appointments')}
            }
            onReject={
                () => {}
            }
        />
      
    const serviceSelector =
        <ServiceSelector
            handleServiceChange={handleServiceChange}
            services={services}
        />

    const weekSelector =
        <WeekSelector
            handleWeekChange={handleWeekChange}
            selectedDate={selectedDate}
            disabledButtonLeft={form.getFieldValue('service') && (selectedDate.startOf('week') > dayjs.tz().startOf('week')) ? false : true}
            disabledButtonRight={form.getFieldValue('service') && (selectedDate.startOf('week') <= dayjs.tz().add(3, 'month').startOf('week'))  ? false : true}
        />

    const daySelector = 
        <DaySelector
            handleDayChange={handleDayChange}
            selectedDate={selectedDate}
            workingDays={workingDays}
            disabledButton={(dayObj) => !isAvaiableDay(dayObj)}
        />

    const hourSelector =
        <HourSelector
            selectedDate={selectedDate}
            handleHourChange={handleHourChange}
            handleMinutesChange={handleMinutesChange}
            startHour={startHour}
            endHour={endHour}
            timeInterval={timeInterval}
            disabledMinutes={
                (itemMinute) => (
                    form.getFieldValue('day') !== null ? !isAvaiableMinute(itemMinute) : true
                )
            }
            disabledHour={
                (hour) => (
                    form.getFieldValue('day') !== null ? !isAvaiableHour(hour) : true
                )
            }
        />

    return (
        <>
            <h1>New appointment</h1>
            {dayjs.tz().format('YYYY-MM-DD HH:mm')}
            <FormWrapper
                    form={form}
                    name="new_appointment"
                    className="new-appointment-form"
                    validateTrigger="onChange"
                    onFinish={() => {setSubmitModalVisible(true)}}
                >
                    <Divider className="divider" orientation="left">Service</Divider>
                    
                    <Spin spinning={!services}>
                        {serviceSelector}
                    </Spin>
                    
                    <Divider className="divider" orientation="left">Select date</Divider>

                        {weekSelector}

                    <Spin spinning={service && Object.keys(currentAvailableSlots).length === 0}>
                        {daySelector}

                        <Divider className="divider" orientation="left">Avaiable hours</Divider>
                        
                        {hourSelector}
                    </Spin>

                    <Divider className="divider" orientation="left">Summary</Divider>

                    {appointmentSummary(false)}
                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="login-form-button">
                            Set new appointment
                        </Button>
                    </Form.Item>
                </FormWrapper>
                {submitModal}
        </>
    )
}

const mapStateToProps = (state) => ({
    services: state.data.services,
    settings: state.data.settings
})

const mapDispatchToProps = {
    getServices,
}

export default connect(mapStateToProps, mapDispatchToProps)(NewAppointment)