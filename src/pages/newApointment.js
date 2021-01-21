import React from 'react';
import moment from 'moment';
import { Form, Input, Button, Radio, Select, Space, Typography, Divider } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

// import { useAppData } from '../util/context';
import { api } from '../util/util'

const { Text } = Typography;

// const availableDates = {
//     [moment().format('YYYY-MM-DD')]: {
//         '12': {'00': false, '15': false, '30': false, '45': true,},
//         '13': {'00': true, '15': false, '30': false, '45': false,},
//         '14': {'00': false, '15': false, '30': false, '45': false,},
//         '15': {'00': true, '15': true, '30': true, '45': false,},
//         '16': {'00': false, '15': false, '30': true, '45': false,},
//         '17': {'00': false, '15': false, '30': false, '45': true,},
//         '18': {'00': true, '15': false, '30': true, '45': true,},
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

// schema

// const responseSchema = {
//     '2021-01-19': {
//         '12': {'00': true, '15': true, '30': true, '45': true},
//         '13': {'00': true, '15': true, '30': true, '45': true}
//     }
// }

const availableDates = {
    [moment().format('YYYY-MM-DD')]: {
        '12': {'45': true,},
        '13': {'00': true,},
        '14': {'00': false, '15': false, '30': false, '45': false,},
        '15': {'00': true, '15': true, '30': true, '45': false,},
        '16': {'00': false, '15': false, '30': true, '45': false,},
        '17': {'00': false, '15': false, '30': false, '45': true,},
        '18': {'00': true, '15': false, '30': true, '45': true,},
    },
    [moment().add(1, 'days').format('YYYY-MM-DD')]: {
        '12': {'00': false, '15': true, '30': true, '45': true,},
        '13': {'00': false, '15': false, '30': false, '45': false,},
        '14': {'00': true, '15': true, '30': false, '45': false,},
        '15': {'00': false, '15': false, '30': true, '45': true,},
        '16': {'00': true, '15': false, '30': false, '45': false,},
        '17': {'00': false, '15': false, '30': true, '45': false,},
        '18': {'00': false, '15': true, '30': false, '45': false,},
    },
    [moment().add(9, 'days').format('YYYY-MM-DD')]: {
        '12': {'00': false, '15': true, '30': true, '45': true,},
        '13': {'00': false, '15': false, '30': false, '45': false,},
        '14': {'00': true, '15': true, '30': false, '45': false,},
        '15': {'00': false, '15': false, '30': true, '45': true,},
        '16': {'00': true, '15': false, '30': false, '45': false,},
        '17': {'00': false, '15': false, '30': true, '45': false,},
        '18': {'00': false, '15': true, '30': false, '45': false,},
    },
}

const NewAppointment = () => {

    const timeInterval = 15
    // const { user } = useAppData()

    const [ selectedWeek, setSelectedWeek ] = React.useState(moment()) //.set({'hour': getFirstAvaiableHour()[0], 'minute': getFirstAvaiableHour()[1]}))
    // const [ availableHours, setAvailableHours ] = React.useState(availableDates[selectedWeek.format('YYYY-MM-DD')])
    const [ availableHours, setAvailableHours ] = React.useState(null)
    const [ services, setServices ] = React.useState(null)
    const [ service, setService ] = React.useState(null)
    const [form] = Form.useForm();

    const timeSpace = generateTimeSpace(selectedWeek.format('DD'), 12, 20, timeInterval)

    React.useEffect(() => {
        // console.log("fetching data from /services")
        // api.get('/services', '', {withCredentials: true})
        api.get('/services')
        .then(res => {
            // console.log(res)
            setServices(res.data)
        }, err => {
            console.log("err:")
            console.log(err)
        })
        .catch(err => {
            console.log("catch err:")
            console.log(err.response.data)
        })
        
    }, [])

    React.useEffect(() => {
        
        const updateFields = () => {
            form.setFieldsValue({
                week: getWeekString(selectedWeek),
                date: selectedWeek
            })
        }

        console.log("effect!")
        // console.log(selectedWeek)
        updateFields()

        
        // const filteredHours = filterAvaiableHours(moment(selectedWeek).format("YYYY-MM-DD"), timeInterval, 30)
        // setAvailableHours(filteredHours)
        
    },[selectedWeek, form, timeSpace])

    

    const getWeekString = (momentDateObj) => {

        const now = moment(momentDateObj)
        let dayOfWeek = parseInt(now.format('d'))
        dayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek
        
        const monday = moment(now).subtract(dayOfWeek - 1, 'days');
        const sunday = moment(now).add(7 - dayOfWeek, 'days');
        
        return `${monday.format('MM.DD')}-${sunday.format('MM.DD')}`
    }

    const onFinish = (values) => {
        if (values.timeMinutes){
            const formTime = values.timeMinutes.split(':')
            setSelectedWeek(prev => moment(prev).set({'hour': formTime[0], 'minute': formTime[1]}))
        }
        // console.log(values.date.format('YYYY-MM-DD'))
        console.log('Submit:', values);
        console.log(
            selectedWeek.format('YYYY-MM-DD HH:mm')
        )

        // api.post('/appointment', {
        //     service: values.service,
        //     date: selectedWeek.toISOString(),
        // }, {withCredentials: true})
        // .then(res => {
        //     // registered successfully go to login page
        //     console.log(res.data.message)
        // }, err => {
        //     console.log(err.response)
        //     // set errors, validate form and clear errror
        //     // setErrors({...err.response.data.errors})
        //     // form.validateFields()
        //     //     .catch(() => {
        //     //         // clear errors and stop loading
        //     //         setErrors({})
        //     //         setFormLoading(false)
        //     //     })
        // })
        // .catch(err => {
        //     console.log('catchError: ' + err)
        //     console.log(err.response)
        // })

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
    }

    function filterAvaiableHours(dayString, interval, duration){
        const requiredSpace = Math.ceil(duration/interval)
        console.log(dayString)
        const noElo = availableDates[dayString]
        setAvailableHours(prev => noElo)
        // const availableHours = availableDates[dayString]
        // console.log(availableDates[dayString])
        // console.log(availableHours)
        let freeSpaces = []

        let wasTrue = false
        let freeSpace = []

        
        timeSpace.forEach(({hour, minutes }, index) => {
            // console.log(hour.format('HH'))

            minutes.forEach((itemMinute, indexMinute) => {
                if (isAvaiableMinute(itemMinute.format('HH'), itemMinute.format('mm'))){
                    freeSpace.push(itemMinute.format('HH:mm'))
                    wasTrue = true
                } else {
                    if (wasTrue) {
                        if (freeSpace.length >= requiredSpace){
                            freeSpaces.push(freeSpace)
                        }
                        freeSpace = []
                    }
                    wasTrue = false
                }

                // console.log(itemMinute.format('HH:mm'))
            })
        })

        console.log(freeSpaces)

        // for(const [hour, minutes] of Object.entries(availableHours)){
        //     for (const [minute, avaiability ] of Object.entries(minutes)){
                
        //     }
        // }
        

        return noElo
    }

    const handleWeekChange = (dir) => {
        if (dir === '+'){
            setSelectedWeek(prev => moment(prev).add(7, 'days'))
        } else if (dir === '-'){
            setSelectedWeek(prev => moment(prev).subtract(7, 'days'))
        }

        form.setFieldsValue({'day': null, 'timeHour': null, 'timeMinutes': null})
    }

    const handleDayChange = (newWeekDay) => {
        const currentWeekDay = selectedWeek.format('d')

        if (currentWeekDay === "0"){
            setSelectedWeek(prev => moment(prev).day(newWeekDay - 7))
        } else {
            setSelectedWeek(prev => moment(prev).day(newWeekDay))

            // setAvailableHours(availableDates[moment(selectedWeek).day(newWeekDay).format("YYYY-MM-DD")])
            // const filteredHours = filterAvaiableHours(moment(selectedWeek).day(newWeekDay).format("YYYY-MM-DD"), timeInterval, 30)
            // setAvailableHours(prev => filteredHours)

            form.setFieldsValue({timeHour: null, timeMinutes: null})
        }
    }

    const handleHourChange = (hour) => {
        console.log(hour)
        let minutes = '00'

        const timeSpaceItem = timeSpace.find((item) => {
            return item.hour.format('HH') === hour
        })

        if (timeSpaceItem) {
            for (let i = 0; i < timeSpaceItem.minutes.length; i++){
                let value = timeSpaceItem.minutes[i].format('mm')

                // TODO isAvaiableDate

                if (availableHours[hour][value] === true){
                    minutes = value
                    break
                }
            } 
        }

        form.setFieldsValue({
            timeMinutes: `${hour}:${minutes}`
        })
        setSelectedWeek(prev => moment(prev).set({'hour': hour, 'minute': minutes}))
    }

    const handleMinutesChange = (val) => {
        console.log(val)
        let [ hour, minutes ] = String(val).split(":")

        form.setFieldsValue({
            timeHour: hour
        })
        setSelectedWeek(prev => moment(prev).set({'hour': hour, 'minute': minutes}))
    }

    function getFirstAvaiableHour(){
        for(const [hour, minutes] of Object.entries(availableHours)){
            for (const [minute, avaiability ] of Object.entries(minutes)){
                if (avaiability) return [hour, minute]
            }
        }
        return null
    }

    const isAvaiableDay = (day) => {
        if (availableDates.hasOwnProperty(day) && form.getFieldValue('service')){
            return Object.keys(availableDates[day]).length > 0
        }
        return false
    }

    const isAvaiableHour = (hour) => {
        if (availableHours && availableHours.hasOwnProperty(hour)){
            return Object.values(availableHours[hour]).includes(true)
        }
        return false
    }
    const isAvaiableMinute = (hour, minutes) => {
        if (availableHours && availableHours.hasOwnProperty(hour) && availableHours[hour].hasOwnProperty(minutes) ){
            return availableHours[hour][minutes]
        }
        return false
    }

    function generateTimeSpace(day, startHour, endHour, intervalMinutes){

        const start = moment().set({'date': day, 'hour': startHour, 'minute': 0, 'second': 0, 'milisecond': 0})
        const end = moment().set({'date': day, 'hour': endHour, 'minute': 59, 'second': 59, 'milisecond': 0})    

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

    const timeTable = timeSpace.map(({hour, minutes }, index) => {

        return (
            <Space  className="time-selector-space-row" direction="horizontal" key={"space"+index}>
                <Radio.Button disabled={form.getFieldValue('day') ? !isAvaiableHour(hour.format('HH')) : true} className="time-button" key={"hour"+index} value={hour.format('HH')}>{hour.format('HH')}</Radio.Button>
                <Form.Item  name="timeMinutes" style={{marginBottom: 0}}>
                    <Radio.Group className="minutes-selector" onChange={(e) => {handleMinutesChange(e.target.value)}}>
                        {
                            minutes.map((itemMinute, indexMinute) => {
                                const isAvaiable = isAvaiableMinute(itemMinute.format('HH'), itemMinute.format('mm'))
                                
                                return (
                                    <Radio.Button disabled={form.getFieldValue('day') ? !isAvaiable : true} key={"minute"+index+"_"+indexMinute} value={itemMinute.format('HH:mm')}>{itemMinute.format('mm')}</Radio.Button>
                                )
                            })
                        }
                    </Radio.Group>
                </Form.Item>
            </Space>
        )
    })

    function onChangeService(value) {
        setService(value)
        console.log(`selected ${value}`);
    }    

    return (
        <>
            <h1>New appointment</h1>
            <h3 style={{display: "inline-block"}}>Day:</h3>
            <span> {selectedWeek ? selectedWeek.format('YYYY-MM-DD HH:mm') : null}</span>
            <Form
                    form={form}
                    name="new_appointment"
                    className="new-appointment-form"
                    initialValues={{
                        // day: parseInt(selectedWeek.format('d')),
                        // week: getWeekString(selectedWeek),
                        // timeHour: getFirstAvaiableHour()[0],
                        // timeMinutes: getFirstAvaiableHour()[0] + ':' + getFirstAvaiableHour()[1]
                    }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    validateTrigger="onSubmit"
                >
                    <Form.Item name="service">
                        <Select
                            showSearch
                            placeholder="Select a service"
                            optionFilterProp="children"
                            onChange={handleServiceChange}
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            rules={[
                                { required: true, message: 'Please select service!' },
                            ]}
                        >
                            {services ? services.map((item, index) => (
                                <Select.Option value={item.name} key={"service" + index}>{item.name}</Select.Option>    
                            )) : <Select.Option>no option loaded</Select.Option>}
                        </Select>
                    </Form.Item>
                    <Divider orientation="left">Select date</Divider>
                    <Space  align="start" style={{width: "100%"}} className="week-selector">
                        <Button icon={<LeftOutlined />} onClick={() => handleWeekChange('-')} />
                        <Form.Item  name="week" style={{width: "100%"}}>
                            <Input placeholder="Basic usage" style={{pointerEvents: "none", textAlign: "center"}}/>
                        </Form.Item>
                        <Button icon={<RightOutlined />} onClick={() => handleWeekChange('+')} />
                    </Space>
                    <Form.Item name="day">
                        <Radio.Group onChange={(e) => handleDayChange(e.target.value)} className="day-selector">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                                const d = selectedWeek.day() === 0 ? index - 6 : index +1
                                const dayObj = moment(selectedWeek).day(d)
                                const disabled = !isAvaiableDay(dayObj.format('YYYY-MM-DD'))
                                return (
                                    <Radio.Button disabled={disabled} key={"radio-day" + index} value={index+1}><p>{day}</p><p>{dayObj.format('DD')}</p></Radio.Button> 
                                )
                            })}
                        </Radio.Group>
                    </Form.Item>
                    <Divider orientation="left">Avaiable hours</Divider>
                    
                    <Form.Item className="time-selector-form-item" name="timeHour">
                        <Radio.Group  className="time-selector-radio-group" onChange={(e) => handleHourChange(e.target.value)}>
                            {timeTable}
                        </Radio.Group>
                    </Form.Item>

                    {/* <Space className="time-selector-container">
                        <Form.Item name="timeHour">
                            <Radio.Group onChange={(e) => handleHourChange(e.target.value)} className="time-selector">
                                {availableHours}
                            </Radio.Group>
                        </Form.Item>
                        <p style={{fontSize: "2rem", width: "30px", textAlign: "center"}}>:</p>
                        <Form.Item name="timeMinutes">
                            <Radio.Group onChange={(e) => handleSecondChange(e.target.value)} className="time-selector">
                                {availableMinutes}
                            </Radio.Group>
                        </Form.Item>
                    </Space> */}

                    <Divider orientation="left">Summary</Divider>
                    <Form.Item className="summary">
                        <p><Text strong>Service:</Text><span>{service}</span></p>
                        <p><Text strong>Date:</Text><span>{form.getFieldValue('day') ? selectedWeek.format('YYYY-MM-DD') : null}</span></p>
                        <p><Text strong>Time:</Text><span>{form.getFieldValue('timeMinutes') ? selectedWeek.format('HH:mm') : null}</span></p>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="login-form-button">
                            Set new appointment
                        </Button>
                    </Form.Item>
                </Form>
        </>
    )
}

export default NewAppointment