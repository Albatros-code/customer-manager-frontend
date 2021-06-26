import React from 'react';
import {useHistory} from 'react-router-dom';

import {dayjsExtended as dayjs} from '../util/util'

import { Form, Button, Divider, Spin, Descriptions} from 'antd';

// redux
import { useAppSelector } from '../redux/store';
import { selectData } from '../redux/slices/dataSlice'

// utils
import { api } from '../util/util';
import { currentWeekString } from '../util/appointments'

// components
import ModalConfirmation from '../components/ModalConfirmation';
import FormWrapper from '../components/FormWrapper';
import DaySelector from '../components/daySelector';
import ServiceSelector from '../components/ServiceSelector';
import WeekSelector from '../components/WeekSelector';
import HourSelector from '../components/HourSelector';

// types
import { IGetAvailableHoursAPI } from '../interfaces'
import { Dayjs } from 'dayjs';

interface IAvailableHours {
    [dataRande: string]: {
        [date: string]: {
            [hour: number]: {
                [minuteInterval: number]: boolean
            }
        },
        
    },
}

const NewAppointment = () => {
    
    const { services, settings } = useAppSelector(selectData)

    const history = useHistory()
    const [form] = Form.useForm();
    
    // from redux
    const {
        start_hour: startHour,
        end_hour: endHour,
        time_interval: timeInterval,
        working_days: workingDays
    } = settings ? settings : {start_hour: undefined, end_hour: undefined, time_interval: undefined, working_days: undefined }
    
    // React.useState
    const [ selectedDate, setSelectedDate ] = React.useState<Dayjs>(dayjs.tz(dayjs()).set({second: 0, millisecond: 0}))
    const [ service, setService ] = React.useState<string | null>(null)
    const [availableSlots, setAvailableSlots] = React.useState<IAvailableHours>({})
    

    const currentAvailableSlots = (() => {
        // if (availableSlots.hasOwnProperty(currentWeekString(selectedDate))){
        if (typeof availableSlots === 'object' && currentWeekString(selectedDate) in availableSlots){
            return availableSlots[currentWeekString(selectedDate)]
        } else {
            return {}
        }
    })()
    
    // useEffect for fetching missing slots availability info
    React.useEffect(() => {

        function getAvailableSlots(
            startDate: string,
            endDate: string,
            setAvailableSlots: (key: any) => void,
            startHour?: number,
            endHour?: number,
            interval?: number,
            service?: string,
            ): void {
            
                api.get<IGetAvailableHoursAPI>('/available-slots', {
                    params: {
                        start_date: startDate,
                        end_date: endDate,
                        start_hour: startHour,
                        end_hour: endHour,
                        interval: interval,
                        service: service
                }})
                    .then(res => {
                        setAvailableSlots((prev: IAvailableHours) => ({...prev, [res.data.date_range]: res.data.slots}))
                    })
        }

        const startDate = selectedDate.startOf('week')
        const endDate = selectedDate.endOf('week')
        // if (service && !availableSlots.hasOwnProperty(`${startDate.format('YYYY-MM-DD')}:${endDate.format('YYYY-MM-DD')}`)){ 
        if (service && !(`${startDate.format('YYYY-MM-DD')}:${endDate.format('YYYY-MM-DD')}` in availableSlots)){ 
            
            getAvailableSlots(startDate.toISOString(), endDate.toISOString(), setAvailableSlots, startHour, endHour, timeInterval, service)
        }
    },[availableSlots, endHour, selectedDate, service, startHour, timeInterval])

    const handleServiceChange = (value: string) => {
        setAvailableSlots({})
        setService(value)
        form.setFieldsValue({
            'day': null,
            'timeHour': null,
            'timeMinutes': null
        })
    }

    const handleWeekChange = (dayObj: Dayjs) => {
        setSelectedDate(dayObj)
        form.setFieldsValue({'day': null, 'timeHour': null, 'timeMinutes': null})
    }

    const handleDayChange = (newWeekDay: number) => {
        setSelectedDate(prev => prev.weekday(newWeekDay))
        form.setFieldsValue({timeHour: null, timeMinutes: null})
    }

    const handleHourChange = (hour: number) => {
        const minutes = Object.entries(currentAvailableSlots[selectedDate.format('YYYY-MM-DD')][hour])
            .filter(([key, val]) => val).map(([key]) => key).sort()[0]

        form.setFieldsValue({
            timeMinutes: `${hour}:${minutes}`
        })
        setSelectedDate(prev => prev.set({hour: hour, minute: minutes}))
    }

    const handleMinutesChange = (val: string) => {
        
        let [ hour, minutes ] = String(val).split(":")

        form.setFieldsValue({
            timeHour: hour
        })
        setSelectedDate(prev => prev.set({hour: hour, minute: minutes}))
    }

    const isAvaiableDay = (timeObj: Dayjs) => {
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

    const isAvaiableHour = (timeObj: Dayjs) => {
        const day = timeObj.format('YYYY-MM-DD')
        const hour = parseInt(timeObj.format('HH'))

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
    
    function isAvaiableMinute(timeObj: Dayjs){
        const day = timeObj.format('YYYY-MM-DD')
        const hour = parseInt(timeObj.format('HH'))
        const minutes = parseInt(timeObj.format('mm'))

        try {
            return currentAvailableSlots[day][hour][minutes]
        } catch {
            return false
        }
    }

    const appointmentSummary = (forModal?: boolean) => {
        const selectedDayDate = () => {
            if (form.getFieldValue('day') && form.getFieldValue('day') !== null){
                return selectedDate.format('YYYY-MM-DD')
            }
        }

        const selectedService = () => {
            if (services && service){
                const serviceName = services.find(item => item.id === service)
                return serviceName ? serviceName.name : ''
            }
        }

        const selectedTime = () => {
            if (form.getFieldValue('timeMinutes')){
                return selectedDate.format('HH:mm') 
            }
        }  

        return(
             <Descriptions 
                bordered
                size="small"
                column={1}
                className={`new-appointment-summary-table ${forModal ? null : 'form-item-padding-bottom'}`}
            >
                <Descriptions.Item label="Service">{selectedService()}</Descriptions.Item>
                <Descriptions.Item label="Date">{selectedDayDate()}</Descriptions.Item>
                <Descriptions.Item label="Time">{selectedTime()}</Descriptions.Item>
            </Descriptions>
        )
    }

    // modal

    const [submitModalVisible, setSubmitModalVisible] = React.useState(false);

    const submitModal = 
        <ModalConfirmation 
            visibilityState={[submitModalVisible, setSubmitModalVisible]}
            title={"Scheduling new appointment"}
            contentInit={appointmentSummary(true)}
            contentResolved={<span>"Appointment added successfully."</span>}
            contentRejected={<p>Something went wrong<br/>Appointment not scheduled.</p>}
            onConfirm={() => {
                return new Promise((resolve, reject) => {
                    const serviceDuration = () => {
                        if (services && service){
                            const serviceName = services.find(item => item.id === service)
                            return serviceName ? serviceName.duration : ''
                        } else {
                            return null
                        }
                    }

                    api.post<any>('/appointments', {
                        service: form.getFieldValue('service'),
                        date: selectedDate.toISOString(),
                        duration: serviceDuration(),
                    })
                        .then(res => {
                            return resolve()
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
            services={services ? services : undefined}
        />

    const weekSelector =
        <WeekSelector
            handleWeekChange={handleWeekChange}
            selectedDate={selectedDate}
            disabledButtonLeft={form.getFieldValue('service') && (selectedDate.startOf('week') > dayjs.tz(dayjs()).startOf('week')) ? false : true}
            disabledButtonRight={form.getFieldValue('service') && (selectedDate.startOf('week') <= dayjs.tz(dayjs()).add(3, 'month').startOf('week'))  ? false : true}
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
            {/* {dayjs.tz().format('YYYY-MM-DD HH:mm')} */}
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

                    <Spin spinning = {typeof service === 'string' && Object.keys(currentAvailableSlots).length === 0}>
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

export default NewAppointment