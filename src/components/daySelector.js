import React from 'react';
import moment from 'moment-timezone';
import { Radio, Button, Input } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const DaySelector = (props) => {
    const {selectedDate, setSelectedDate} = props
    
    let [ selectorSelectedDate, setSelectorSelectedDate ] = React.useState(moment.tz(new Date(),'Europe/Warsaw').set({'second': 0, 'millisecond': 0}))
    
    if (selectedDate && setSelectedDate) {
        selectorSelectedDate = selectedDate
        setSelectorSelectedDate = setSelectedDate
    }

    const handleWeekChange = (dir) => {
        const newDate = dir === '+' ? moment(selectorSelectedDate).add(7, 'days') : moment(selectorSelectedDate).subtract(7, 'days')        
        setSelectorSelectedDate(newDate)
    }

    const handleDayChange = (newWeekDay) => {
        const currentWeekDay = selectorSelectedDate.format('d')
        
        setSelectorSelectedDate(prev => 
            moment(prev).day(currentWeekDay === "0" ? newWeekDay - 7 : newWeekDay)
        )
    }

    // const disableArrowBack = () => {
    //     const result = isBeforeToday(moment(selectorSelectedDate).subtract(7, 'days'))

    //     return props.disableArrowBack ?  props.disableArrowBack : result
    // }



    return (
        <>
            {/* <p><strong>Day selector selected date:</strong> {selectorSelectedDate.format('YYYY-MM-DD HH-mm-ss')}</p> */}

            <div 
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                }}
            >
                <Button 
                    style={{
                        marginRight: '1rem',
                        width: '80px',
                    }}
                    disabled={false} 
                    icon={<LeftOutlined />}
                    onClick={() => handleWeekChange('-')} 
                />
                <Input placeholder="Basic usage" style={{pointerEvents: "none", textAlign: "center", flexGrow: '1'}} value={getWeekString(selectorSelectedDate)}/>
                <Button
                    style={{
                        marginLeft: '1rem',
                        width: '80px',
                    }}
                    disabled={true ? false : true}
                    icon={<RightOutlined />}
                    onClick={() => handleWeekChange('+')}
                />
            </div>
            <Radio.Group
                style={{
                    marginBottom: '1rem'
                }}
                className="day-selector"
                onChange={(e) => handleDayChange(e.target.value)}
                value={selectorSelectedDate.day()}
            >
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                    const d = selectorSelectedDate.day() === 0 ? index - 6 : index +1
                    const dayObj = moment(selectorSelectedDate).day(d)
                    // const disabled = !isAvaiableDay(dayObj)
                    let disabled = isBeforeToday(dayObj)
                    disabled = false
                    return (
                        <Radio.Button disabled={disabled} key={"radio-day" + index} value={index+1}><p>{day}</p><p>{dayObj.format('DD')}</p></Radio.Button> 
                    )
                })}
            </Radio.Group>
        </>
    )
}

function isBeforeToday(dateObj){
    const today = moment.tz(new Date(),'Europe/Warsaw').set({'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0})
    return dateObj.isBefore(today)
}

export default DaySelector

function getWeekStartDate(dateObj){
    return (moment(dateObj).day(1)).set({'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0})
}

function getWeekEndDate(dateObj){
    return (moment(dateObj).day(7)).set({'hour': 23, 'minute': 59, 'second': 59, 'millisecond': 0})
}

function getWeekString(dateObj){
    const startDate = getWeekStartDate(dateObj)
    const endDate = getWeekEndDate(dateObj)
    return startDate.format('YYYY-MM-DD') + ' : ' + endDate.format('YYYY-MM-DD')
}


