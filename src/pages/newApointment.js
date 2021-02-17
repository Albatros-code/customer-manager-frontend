import React from 'react';
import {useHistory} from 'react-router-dom';
import moment from 'moment-timezone';
import { Form, Input, Button, Radio, Select, Space, Typography, Divider, Modal, Spin } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

// redux
import { connect } from 'react-redux';
import { getServices, getAvaiableDates } from '../redux/actions/dataActions';
import { api } from '../util/util';



const { Text } = Typography;

// const availableDatesMock = {
//     [moment().format('YYYY-MM-DD')]: {
//         '12': {'45': true,},
//         '13': {'00': true,},
//         '15': {'00': true, '15': true, '30': true,},
//         '16': {'30': true,},
//         '17': {'45': true,},
//         '18': {'00': true, '30': true, '45': true,},
//     },
//     [moment().add(1, 'days').format('YYYY-MM-DD')]: {
//         '12': {'00': false, '15': true, '30': true, '45': true,},
//         '13': {'00': false, '15': false, '30': false, '45': false,},
//         '14': {'00': true, '15': true, '30': false, '45': false,},
//         '15': {'00': false, '15': false, '30': true, '45': true,},
//         '16': {'00': true, '15': false, '30': false, '45': false,},
//         '17': {'00': false, '15': false, '30': true, '45': false,},
//         '18': {'00': false, '15': true, '30': false, '45': false,},
//     },
// }

const NewAppointment = (props) => {

    const startHour = 12
    const endHour = 20
    const timeInterval = 15

    const { getServices, getAvaiableDates } = props
    const { services, availableDatesFetched } = props

    const history = useHistory()

    const [ selectedDate, setSelectedDate ] = React.useState(moment.tz(new Date(),'Europe/Warsaw').set({'second': 0, 'millisecond': 0}))
    const [ availableDates, setAvailableDates ] = React.useState(null)
    const [ service, setService ] = React.useState(null)

    const [form] = Form.useForm();

    const timeTableBase = generateTimeTableBase(selectedDate, startHour, endHour, timeInterval)

    React.useEffect(() => {
        getServices()
        getAvaiableDates(startHour, endHour, timeInterval)
    // eslint-disable-next-line react-hooks/exhaustive-deps  
    }, [])   


    const onFinish = (values) => {
        console.log('Submit:', values);
        console.log(
            selectedDate.toISOString()
        )
        
        showSubmitModal()

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
        // console.log(availableDatesFetched)
        let availableDatesUpdate = JSON.parse(JSON.stringify(availableDatesFetched ? availableDatesFetched : {}))

        const requiredSpace = Math.ceil(duration/interval)

        let freeSpaceToRemove = []
        let freeSpace = []

        // find free spaces in aviable hours
        for (const [day, hours] of Object.entries(availableDatesUpdate).sort()){
            for (const [hour, minutes] of Object.entries(hours).sort()){
                for (const [minute, value] of Object.entries(minutes).sort()){
                    if (value) {
                        let timeObj = moment(day).set({'hour': hour, 'minute': minute})
                        if (freeSpace.length === 0 || freeSpace[freeSpace.length-1].isSame(moment(timeObj).subtract(interval, 'minute')) ){
                            freeSpace.push(moment(timeObj))
                        } else {
                            if (freeSpace.length >= requiredSpace){
                                freeSpaceToRemove.push(...freeSpace.slice(freeSpace.length-requiredSpace+1))
                            } else {
                                freeSpaceToRemove.push(...freeSpace)
                            }
                            freeSpace = []
                            freeSpace.push(moment(timeObj))
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

    const getWeekString = (momentDateObj) => {

        const now = moment(momentDateObj)
        let dayOfWeek = parseInt(now.format('d'))
        dayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek
        
        const monday = moment(now).subtract(dayOfWeek - 1, 'days');
        const sunday = moment(now).add(7 - dayOfWeek, 'days');
        
        return `${monday.format('MM.DD')}-${sunday.format('MM.DD')}`
    }

    const handleWeekChange = (dir) => {
        const newDate = dir === '+' ? moment(selectedDate).add(7, 'days') : moment(selectedDate).subtract(7, 'days')        
        setSelectedDate(newDate)
        form.setFieldsValue({'week': getWeekString(newDate),'day': null, 'timeHour': null, 'timeMinutes': null})
    }

    const handleDayChange = (newWeekDay) => {
        const currentWeekDay = selectedDate.format('d')

        if (currentWeekDay === "0"){
            setSelectedDate(prev => moment(prev).day(newWeekDay - 7))
        } else {
            setSelectedDate(prev => moment(prev).day(newWeekDay))
        }

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
        setSelectedDate(prev => moment(prev).set({'hour': hour, 'minute': minutes}))
    }

    const handleMinutesChange = (val) => {
        console.log(val)
        let [ hour, minutes ] = String(val).split(":")

        form.setFieldsValue({
            timeHour: hour
        })
        setSelectedDate(prev => moment(prev).set({'hour': hour, 'minute': minutes}))
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

        const start = moment(dateObj).set({'hour': startHour, 'minute': 0, 'second': 0, 'milisecond': 0})
        const end = moment(dateObj).set({'hour': endHour, 'minute': 59, 'second': 59, 'milisecond': 0})

        let array = []
        let current = moment(start)

        do {

            let minutesArray = []
            let minutes = 0
            do {
                minutesArray.push(moment(current).set({'minute': minutes}))
                minutes = minutes + intervalMinutes
            } while (minutes < 60)

            let item = {
                hour: current,
                minutes: minutesArray,
            }

            array.push(item)
            current = moment(current).add(1, 'hour')
            
            } while (current.isBefore(end));

        return array
    }

    // modal

    const submitModalTextInit = (loading) => (
        <Spin spinning={loading}>
            <div className="submit-modal-container">
                <div>
                    <Text strong>Service:</Text>
                    <Text strong>Date:</Text>
                    <Text strong>Time:</Text>
                </div>
                <div>
                    <span>{service} and some other long description</span>
                    <span>{form.getFieldValue('day') ? selectedDate.format('YYYY-MM-DD') : null}</span>
                    <span>{form.getFieldValue('timeMinutes') ? selectedDate.format('HH:mm') : null}</span>
                </div>
            </div>
        </Spin>
    )

    const [submitModalVisible, setSubmitModalVisible] = React.useState(false);
    // const [submitModalConfirmLoading, setSubmitModalConfirmLoading] = React.useState(false);
    const [submitModalButtonProps, setSubmitModalButtonProps] = React.useState({disabled:false})
    const [submitModalText, setSubmitModalText] = React.useState(submitModalTextInit(false));
  
    const showSubmitModal = () => {
        setSubmitModalText(submitModalTextInit(false))
        setSubmitModalVisible(true);
    };
  
    const submitModalHandleOk = () => {
        setSubmitModalText(submitModalTextInit(true));
        setSubmitModalButtonProps({disabled:true})

        api.post('/appointment', {
            service: form.getFieldValue('service'),
            date: selectedDate.toISOString(),
            duration: services.find(item => item.name === form.getFieldValue('service')).time,
        }, {withCredentials: true})
        .then(res => {
            // registered successfully go to login page
            console.log(res.data.message)
            history.push('/scheduled-appointments')
        }, err => {
            console.log(err.response)
            // set errors, validate form and clear errror
            // setErrors({...err.response.data.errors})
            // form.validateFields()
            //     .catch(() => {
            //         // clear errors and stop loading
            //         setErrors({})
            //         setFormLoading(false)
            //     })
        })
        .catch(err => {
            console.log('catchError: ' + err)
            console.log(err.response)
        })

        setTimeout(() => {
            setSubmitModalVisible(false);
            setSubmitModalButtonProps({disabled:false})
        }, 2000);
    };
  
    const submitModalHandleCancel = () => {
        console.log('Clicked cancel button');
        setSubmitModalVisible(false);
    };

    const submitModal = 
        <Modal
            title="Scheduling new appointment"
            visible={submitModalVisible}
            onOk={submitModalHandleOk}
            // confirmLoading={submitModalConfirmLoading}
            onCancel={submitModalHandleCancel}
            okText={'Confirm'}
            okButtonProps={submitModalButtonProps}
            cancelButtonProps={submitModalButtonProps}
        >
            {submitModalText}
        </Modal>

    return (
        <>
            <h1>New appointment</h1>
            {/* <h3 style={{display: "inline-block"}}>Day:</h3>
            <span> {selectedDate ? selectedDate.format('YYYY-MM-DD HH:mm') : null}</span> */}
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
                                const d = selectedDate.day() === 0 ? index - 6 : index +1
                                const dayObj = moment(selectedDate).day(d)
                                const disabled = !isAvaiableDay(dayObj)
                                return (
                                    <Radio.Button disabled={disabled} key={"radio-day" + index} value={index+1}><p>{day}</p><p>{dayObj.format('DD')}</p></Radio.Button> 
                                )
                            })}
                        </Radio.Group>
                    </Form.Item>

                    <Divider className="divider" orientation="left">Avaiable hours</Divider>
                    
                    <Form.Item
                        className="time-selector-form-item"
                        name="timeHour"
                        rules={[
                            form.getFieldValue('day') ? { required: true, message: 'Please select hour!' } : null,
                        ]}
                    >
                        <Radio.Group  className="time-selector-radio-group" onChange={(e) => handleHourChange(e.target.value)}>
                            {timeTableBase.map(({hour, minutes }, index) => (
                                <Space  className="time-selector-space-row" direction="horizontal" key={"space"+index}>
                                    <Radio.Button disabled={form.getFieldValue('day') ? !isAvaiableHour(hour) : true} className="time-button" key={"hour"+index} value={hour.format('HH')}>{hour.format('HH')}</Radio.Button>
                                    <Form.Item  name="timeMinutes" style={{marginBottom: 0}}>
                                        <Radio.Group className="minutes-selector" onChange={(e) => {handleMinutesChange(e.target.value)}}>
                                            {minutes.map((itemMinute, indexMinute) => (
                                                <Radio.Button disabled={form.getFieldValue('day') ? !isAvaiableMinute(itemMinute) : true} key={"minute"+index+"_"+indexMinute} value={itemMinute.format('HH:mm')}>{itemMinute.format('mm')}</Radio.Button>
                                            ))}
                                        </Radio.Group>
                                    </Form.Item>
                                </Space>
                            ))}
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
                        <p><Text strong>Date:</Text><span>{form.getFieldValue('day') ? selectedDate.format('YYYY-MM-DD') : null}</span></p>
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
})

const mapDispatchToProps = {
    getServices,
    getAvaiableDates,
}

export default connect(mapStateToProps, mapDispatchToProps)(NewAppointment)