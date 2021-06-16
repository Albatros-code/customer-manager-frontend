import React from 'react';
import {Form, Radio} from 'antd';

import {dayjsExtended as dayjs} from '../util/util'

// types
import { Dayjs } from 'dayjs';
import type { IGetSettingsAPI } from '../interfaces'
import { RadioChangeEvent } from 'antd/lib/radio';

interface IDaySelecor {
    selectedDate: Dayjs,
    handleDayChange: (dayNo: number) => any,
    workingDays?: IGetSettingsAPI['working_days'],
    disabledButton: boolean | ((dayObj: Dayjs) => boolean),
    formItemName?: string,
}

const DaySelector = (props: IDaySelecor) => {
    // const {form} = useFormContext()

    const {handleDayChange, disabledButton, formItemName, workingDays} = props

    const [selectedDateInternal, setSelectedDateInternal] = React.useState(dayjs.tz(dayjs()).set({day: 15, second: 0, millisecond: 0}))

    const selectedDate = props.selectedDate ?
        props.selectedDate : selectedDateInternal
   
    function resolveProp(prop: any, ...args: any){
        if (typeof prop === 'function'){
            return prop(...args)
        } else {
            return prop
        }
    }

    const handleChange = (e: RadioChangeEvent) => {
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
                    const key = index
                    if (workingDays && typeof workingDays === 'object' && key in workingDays){
                        if (workingDays[key as keyof IGetSettingsAPI['working_days']] === false) return null
                    }
                    
                    const dayObj = selectedDate.weekday(index)
                    return (
                        <Radio.Button disabled={resolveProp(disabledButton, dayObj, index)} key={"radio-day" + index} value={index}><p>{day}</p><p>{dayObj.format('DD')}</p></Radio.Button> 
                    )
                })}
            </Radio.Group>
        </Form.Item>
    )
}

export default DaySelector