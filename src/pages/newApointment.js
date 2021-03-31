import React from 'react';
import {useHistory} from 'react-router-dom';

import {dayjsExtended as dayjs} from '../util/util'

import { Form, Input, Button, Radio, Select, Space, Typography, Divider} from 'antd';
import { ConsoleSqlOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';

// redux
import { connect } from 'react-redux';
import { getServices, getAvaiableDates } from '../redux/actions/dataActions';
import { api } from '../util/util';

// components
import ModalConfirmation from '../components/ModalConfirmation'
// import axios from 'axios';

const { Text } = Typography;

const NewAppointment = (props) => {
    const history = useHistory()
    const [form] = Form.useForm();
    
    const {settings: {startHour, endHour, timeInterval}} = props
    
    const { getServices, getAvaiableDates } = props
    const { services, availableDatesFetched } = props
    
    
    // const [ selectedDate, setSelectedDate ] = React.useState(dayjs().tz("Europe/Warsaw").set({second: 0, millisecond: 0}))
    const [ selectedDate, setSelectedDate ] = React.useState(dayjs.tz().set({second: 0, millisecond: 0}))
    const [ availableDates, setAvailableDates ] = React.useState(null)
    const [ service, setService ] = React.useState(null)  
    const [ appointments, setAppointments ] = React.useState({})
    
    // const timeTableBase = generateTimeTableBase(dayjs(selectedDate).tz("Europe/Warsaw"), startHour, endHour, timeInterval)
    const timeTableBase = generateTimeTableBase(selectedDate, startHour, endHour, timeInterval)
    
    React.useEffect(() => {
        getServices()
        getAvaiableDates(startHour, endHour, timeInterval)
    // eslint-disable-next-line react-hooks/exhaustive-deps  
    },[])

    React.useEffect(() =>{
        function getAppointments(startDate, endDate){
            api.get('/appointments', {
                params: {
                    start_date: startDate,
                    end_date: endDate,
            }})
                .then(res => {
                    setAppointments((prev) => ({...prev, [startDate]: res.data}))
                })
        }
        const startDate = selectedDate.startOf('week').toISOString()
        const endDate = selectedDate.endOf('week').toISOString()
        if (!appointments.hasOwnProperty(startDate)){
            getAppointments(startDate, endDate)
        }
        
    },[selectedDate, appointments])

    function getReservedSlots(dayObj, appointments, startHour, endHour, timeInterval){
        // set objects for start and end hour
        const startDate = dayObj.set({hour: startHour}).startOf('hour')
        const endDate = dayObj.set({hour: endHour}).startOf('hour')

        // filter appointments for single day
        appointments = appointments[dayObj.startOf('week').toISOString()].filter((item) => ( 
            startDate.toISOString() < item.date &&  endDate.toISOString() > item.date
        ))

        // generate object with reserved slots
        const reservedSlots = {}
        
        if (appointments.length === 0){
            return reservedSlots
        }

        appointments.forEach(appointment => {

        })

    }


    function getAvailableSlots(dayObj, appointments, startHour, endHour, timeInterval){
        const startDate = dayObj.set({hour: startHour}).startOf('hour')
        const endDate = dayObj.set({hour: endHour}).startOf('hour')

        appointments = appointments[dayObj.startOf('week').toISOString()].filter((item) => ( 
            startDate.toISOString() < item.date &&  endDate.toISOString() > item.date
        ))

        function minutes(){
            const minutes = {}
            let currentMinutes = 0
            while (currentMinutes < 60){
                minutes[("0" + currentMinutes).slice(-2)] = true
                currentMinutes += timeInterval
            }
            return minutes
        }

        function hours(){
            const hours = {}
            let currentHour = startHour
            while (currentHour <= endHour){
                hours[("0" + currentHour).slice(-2)] = minutes()
                currentHour += 1
            }
            return hours
        }

        const availableHours = hours()

        // remove ocupied slots
        appointments.forEach(appointment => {
            let timeObj = dayjs(appointment.date)
            let space = Math.ceil(parseInt(appointment.duration)) / timeInterval
            for (let i = 0; i < space; i++){
                // console.log(timeObj.format("HH:mm"))
                delete availableHours[timeObj.format('HH')][timeObj.format('mm')]
                timeObj = timeObj.add(timeInterval, 'minute')
            }
        })
        
        console.log(availableHours)
    }

    if (Object.keys(appointments).length !== 0){
        getAvailableSlots(selectedDate, appointments, startHour, endHour, timeInterval)
    }

    const onFinish = (values) => {
        console.log('Submit:', values);
        console.log(
            selectedDate.toISOString()
        )

        setSubmitModalVisible(true)
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    const handleServiceChange = (value) => {
        setService(value)
        console.log(`selected ${value}`);
        form.setFieldsValue({
            'day': null,
            'timeHour': null,
            'timeMinutes': null
        })
        const duration = services.find(item => item.name === value).time
        setAvailableDates(filterAvaiableDates(timeInterval, duration))
    }

    
    function filterAvaiableDates(interval, duration){
        let availableDatesUpdate = JSON.parse(JSON.stringify(availableDatesFetched ? availableDatesFetched : {}))

        const requiredSpace = Math.ceil(duration/interval)

        let freeSpaceToRemove = []
        let freeSpace = []

        // find free spaces in aviable hours
        for (const [day, hours] of Object.entries(availableDatesUpdate).sort()){
            for (const [hour, minutes] of Object.entries(hours).sort()){
                for (const [minute, value] of Object.entries(minutes).sort()){
                    if (value) {
                        let timeObj = dayjs(day).tz().set({hour: hour, minute: minute})
                        if (freeSpace.length === 0 || freeSpace[freeSpace.length-1].isSame(timeObj.subtract(interval, 'minute')) ){
                            freeSpace.push(timeObj)
                        } else {
                            if (freeSpace.length >= requiredSpace){
                                freeSpaceToRemove.push(...freeSpace.slice(freeSpace.length-requiredSpace+1))
                            } else {
                                freeSpaceToRemove.push(...freeSpace)
                            }
                            freeSpace = []
                            freeSpace.push(timeObj)
                        }
                    }                
                }
            }
        }

        if (freeSpace.length >= requiredSpace){
            freeSpaceToRemove.push(...freeSpace.slice(freeSpace.length-requiredSpace+1))
        } else {
            freeSpaceToRemove.push(...freeSpace)
        }
        freeSpace = []    
        
        freeSpaceToRemove.forEach(freeSpace => {
            let day = freeSpace.format('YYYY-MM-DD')
            let hour = freeSpace.format('HH')
            let minutes = freeSpace.format('mm')
            availableDatesUpdate[day][hour][minutes] = false
        })

        return availableDatesUpdate
    }

    const getWeekString = (dayjsDateObj) => {

        const now = dayjs(dayjsDateObj).tz()
        let dayOfWeek = parseInt(now.weekday())
        
        const monday = now.subtract(dayOfWeek, 'days');
        const sunday = now.add(6 - dayOfWeek, 'days');
        
        return `${monday.format('MM.DD')}-${sunday.format('MM.DD')}`
    }

    const handleWeekChange = (dir) => {
        const newDate = dir === '+' ? selectedDate.add(7, 'days') : selectedDate.subtract(7, 'days')        
        setSelectedDate(newDate)
        form.setFieldsValue({'week': getWeekString(newDate),'day': null, 'timeHour': null, 'timeMinutes': null})
    }

    const handleDayChange = (newWeekDay) => {
        setSelectedDate(prev => prev.weekday(newWeekDay))
        form.setFieldsValue({timeHour: null, timeMinutes: null})
    }

    const handleHourChange = (hour) => {
        console.log(hour)
        let minutes = '00'

        const timeSpaceItem = timeTableBase.find((item) => {
            return item.hour.format('HH') === hour
        })

        if (timeSpaceItem) {
            for (let i = 0; i < timeSpaceItem.minutes.length; i++){
                let value = timeSpaceItem.minutes[i].format('mm')

                if (availableDates[selectedDate.format('YYYY-MM-DD')][hour][value] === true){
                    minutes = value
                    break
                }
            } 
        }

        form.setFieldsValue({
            timeMinutes: `${hour}:${minutes}`
        })
        setSelectedDate(prev => prev.set({hour: hour, minute: minutes}))
    }

    const handleMinutesChange = (val) => {
        console.log(val)
        let [ hour, minutes ] = String(val).split(":")

        form.setFieldsValue({
            timeHour: hour
        })
        setSelectedDate(prev => prev.set({hour: hour, minute: minutes}))
    }

    const isAvaiableDay = (timeObj) => {
        const day = timeObj.format('YYYY-MM-DD')

        if (availableDates && availableDates.hasOwnProperty(day) && form.getFieldValue('service')){
            return Object.keys(availableDates[day]).length > 0
        }
        return false
    }

    const isAvaiableHour = (timeObj) => {
        const day = timeObj.format('YYYY-MM-DD')
        const hour = timeObj.format('HH')

        if (isAvaiableDay(timeObj) && availableDates[day].hasOwnProperty(hour)){
            return Object.values(availableDates[day][hour]).includes(true)
        }
        return false
        }
    
    const isAvaiableMinute = (timeObj) => {
        const day = timeObj.format('YYYY-MM-DD')
        const hour = timeObj.format('HH')
        const minutes = timeObj.format('mm')

        if (isAvaiableHour(timeObj) && availableDates[day][hour].hasOwnProperty(minutes) ){
            return availableDates[day][hour][minutes]
        }
        return false
    }

    function generateTimeTableBase(dateObj, startHour, endHour, intervalMinutes){

        const start = dateObj.set({hour: startHour, minute: 0, second: 0, millisecond: 0})
        const end = dateObj.set({hour: endHour-1, minute: 59, second: 59, millisecond: 999})
        // console.log(start)
        // console.log(end)

        let array = []
        let current = dayjs(start)
        do {

            let minutesArray = []
            let minutes = 0
            do {
                minutesArray.push(current.set({minute: minutes}))
                minutes = minutes + intervalMinutes
            } while (minutes < 60)

            let item = {
                hour: current,
                minutes: minutesArray,
            }

            array.push(item)
            current = current.add(1, 'hour')
            
            } while (current < end);
        return array
    }

    // modal

    const [submitModalVisible, setSubmitModalVisible] = React.useState(false);

    const submitModal = 
        <ModalConfirmation 
            visibilityState={[submitModalVisible, setSubmitModalVisible]}
            title={"Scheduling new appointment"}
            contentInit={
                <>
                    <div>
                        <Text strong>Service:</Text>
                        <Text strong>Date:</Text>
                        <Text strong>Time:</Text>
                    </div>
                    <div>
                        <span>{service} and some other long description</span>
                        <span>{form.getFieldValue('day') !== null ? selectedDate.format('YYYY-MM-DD') : null}</span>
                        <span>{form.getFieldValue('timeMinutes') ? selectedDate.format('HH:mm') : null}</span>
                    </div>
                </>
            }
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
                () => {console.log('onReject')}
            }
        />

    return (
        <>
            <h1>New appointment</h1>
            <Form
                    form={form}
                    name="new_appointment"
                    className="new-appointment-form"
                    initialValues={{
                        week: getWeekString(selectedDate), }}
                    // validateTrigger="onSubmit"
                    validateTrigger="onChange"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                >
                    <Divider className="divider" orientation="left">Service</Divider>
                    
                    <Form.Item 
                        name="service"
                        rules={[
                            { required: true, message: 'Please select service!' },
                        ]}
                    >
                        <Select
                            showSearch
                            placeholder="Select a service"
                            optionFilterProp="children"
                            disabled={!services}
                            onChange={handleServiceChange}
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {services ? services.map((item, index) => (
                                <Select.Option value={item.name} key={"service" + index}>{item.name} - {item.time} min</Select.Option>    
                            )) : <Select.Option>no option loaded</Select.Option>}
                        </Select>
                    </Form.Item>
                    
                    <Divider className="divider" orientation="left">Select date</Divider>

                    <Space  align="start" style={{width: "100%"}} className="week-selector">
                        <Button disabled={form.getFieldValue('service') ? false : true} icon={<LeftOutlined />} onClick={() => handleWeekChange('-')} />
                        <Form.Item  name="week" style={{width: "100%"}}>
                            <Input placeholder="Basic usage" style={{pointerEvents: "none", textAlign: "center"}}/>
                        </Form.Item>
                        <Button disabled={form.getFieldValue('service') ? false : true} icon={<RightOutlined />} onClick={() => handleWeekChange('+')} />
                    </Space>

                    <Form.Item 
                        name="day"
                        rules={[
                            form.getFieldValue('service') ? { required: true, message: 'Please select day!' } : null,
                        ]}
                    >
                        <Radio.Group onChange={(e) => handleDayChange(e.target.value)} className="day-selector">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                                const dayObj = selectedDate.weekday(index)
                                const disabled = !isAvaiableDay(dayObj)
                                return (
                                    <Radio.Button disabled={disabled} key={"radio-day" + index} value={index}><p>{day}</p><p>{dayObj.format('DD')}</p></Radio.Button> 
                                )
                            })}
                        </Radio.Group>
                    </Form.Item>

                    <Divider className="divider" orientation="left">Avaiable hours</Divider>
                    
                    <Form.Item
                        className="time-selector-form-item"
                        name="timeHour"
                        rules={[
                            form.getFieldValue('day') !== null ? { required: true, message: 'Please select hour!' } : null,
                        ]}
                    >
                        <Radio.Group  className="time-selector-radio-group" onChange={(e) => handleHourChange(e.target.value)}>
                            {timeTableBase.map(({hour, minutes }, index) => {
                                return(
                                    <Space  className="time-selector-space-row" direction="horizontal" key={"space"+index}>
                                        <Radio.Button disabled={form.getFieldValue('day') !== null ? !isAvaiableHour(hour) : true} className="time-button" key={"hour"+index} value={hour.format('HH')}>{hour.format('HH')}</Radio.Button>
                                        <Form.Item  name="timeMinutes" style={{marginBottom: 0}}>
                                            <Radio.Group className="minutes-selector" onChange={(e) => {handleMinutesChange(e.target.value)}}>
                                                {minutes.map((itemMinute, indexMinute) => (
                                                    <Radio.Button disabled={form.getFieldValue('day') !== null ? !isAvaiableMinute(itemMinute) : true} key={"minute"+index+"_"+indexMinute} value={itemMinute.format('HH:mm')}>{itemMinute.format('mm')}</Radio.Button>
                                                ))}
                                            </Radio.Group>
                                        </Form.Item>
                                    </Space>
                                )
                            })}
                        </Radio.Group>
                    </Form.Item>

                    <Divider className="divider" orientation="left">Summary</Divider>

                    <Form.Item
                        className="summary"
                        rules={[
                            form.getFieldValue('service') ? { required: true, message: 'Please select day!' } : null,
                        ]}
                    >
                        <p><Text strong>Service:</Text><span>{service}</span></p>
                        <p><Text strong>Date:</Text><span>{form.getFieldValue('day') !== null ? selectedDate.format('YYYY-MM-DD') : null}</span></p>
                        <p><Text strong>Time:</Text><span>{form.getFieldValue('timeMinutes') ? selectedDate.format('HH:mm') : null}</span></p>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="login-form-button">
                            Set new appointment
                        </Button>
                    </Form.Item>
                </Form>
                {submitModal}
        </>
    )
}

const mapStateToProps = (state) => ({
    services: state.data.services,
    availableDatesFetched: state.data.avaiableDates,
    settings: state.data.settings
})

const mapDispatchToProps = {
    getServices,
    getAvaiableDates,
}

export default connect(mapStateToProps, mapDispatchToProps)(NewAppointment)