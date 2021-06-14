import React from 'react';
import {Form, Space, Input, Button} from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

import {useFormContext} from './FormWrapper'
import {dayjsExtended as dayjs} from '../util/util'
import {currentWeekString} from '../util/appointments'
import { Dayjs } from 'dayjs';

interface IWeekSelector{
    selectedDate: Dayjs,
    handleWeekChange: (dateObj: Dayjs) => any,
    disabledButtonLeft: boolean,
    disabledButtonRight: boolean,

}

const WeekSelector = (props:IWeekSelector) => {

    const {form} = useFormContext()
    
    const {handleWeekChange, disabledButtonLeft, disabledButtonRight} = props
    
    const [selectedDateInternal, setSelectedDateInternal] = React.useState(dayjs.tz(dayjs()).set({day: 15, second: 0, millisecond: 0}))

    const selectedDate = props.selectedDate ?
        props.selectedDate : selectedDateInternal
    
    const handleChange = (dir: '+' | '-') => {
        const dateObj = dir === '+' ? selectedDate.add(7, 'days') : selectedDate.subtract(7, 'days') 
        setSelectedDateInternal(dateObj)
        if (handleWeekChange){
            handleWeekChange(dateObj)
        }
    }

    React.useEffect(() => {
        // console.log('weekSelector: ' + selectedDate.format('MM.DD'))
        form.setFieldsValue({'week': currentWeekString(selectedDate, 'display')})
    }, [selectedDate, form])

    return (
        <Space  align="start" style={{width: "100%"}} className="week-selector">
            <Button disabled={disabledButtonLeft} icon={<LeftOutlined />} onClick={() => handleChange('-')} />
            <Form.Item  name="week" style={{width: "100%"}}>
                <Input placeholder="" style={{pointerEvents: "none", textAlign: "center"}}/>
            </Form.Item>
            <Button disabled={disabledButtonRight} icon={<RightOutlined />} onClick={() => handleChange('+')} />
        </Space>
    )
}

export default WeekSelector