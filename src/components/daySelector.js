import React from 'react';
import {Form, Radio} from 'antd';

import {dayjsExtended as dayjs} from '../util/util'
// import {useFormContext} from '../components/FormWrapper'

const DaySelector = (props) => {
    // const {form} = useFormContext()

    const {handleDayChange, disabledButton, formItemName, workingDays} = props

    const [selectedDateInternal, setSelectedDateInternal] = React.useState(dayjs.tz().set({day: 15, second: 0, millisecond: 0}))

    const selectedDate = props.selectedDate ?
        props.selectedDate : selectedDateInternal
   
    function resolveProp(prop, ...args){
        if (typeof prop === 'function'){
            return prop(...args)
        } else {
            return prop
        }
    }

    const handleChange = (e) => {
        setSelectedDateInternal(selectedDate.weekday(e.target.value))
        if (handleDayChange){
            handleDayChange(e.target.value)
        }
    }

    return (
        <Form.Item 
            name={formItemName ? formItemName : "day"}
            rules={[
                { required: true, message: 'Please select day!' },
            ]}
        >
            <Radio.Group onChange={handleChange} className="day-selector">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                    if (workingDays && workingDays[index] === false) return null
                    const dayObj = selectedDate.weekday(index)
                    // const disabled = !isAvaiableDay(dayObj)
                    // const disabled = disabledButton(dayObj, index)
                    return (
                        <Radio.Button disabled={resolveProp(disabledButton, dayObj, index)} key={"radio-day" + index} value={index}><p>{day}</p><p>{dayObj.format('DD')}</p></Radio.Button> 
                    )
                })}
            </Radio.Group>
        </Form.Item>
    )
}

export default DaySelector