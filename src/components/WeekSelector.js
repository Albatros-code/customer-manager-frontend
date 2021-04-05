import React from 'react';
import {Form, Space, Input, Button} from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

import {useFormContext} from '../components/FormWrapper'
import {dayjsExtended as dayjs} from '../util/util'

const WeekSelector = (props) => {

    const {form} = useFormContext()
    
    const {handleWeekChange, disabledButtonLeft, disabledButtonRight} = props
    
    const [selectedDateInternal, setSelectedDateInternal] = React.useState(dayjs.tz().set({day: 15, second: 0, millisecond: 0}))

    const selectedDate = props.selectedDate ?
        props.selectedDate : selectedDateInternal
    
    const handleChange = (dir) => {
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
                <Input placeholder="Basic usage" style={{pointerEvents: "none", textAlign: "center"}}/>
            </Form.Item>
            <Button disabled={disabledButtonRight} icon={<RightOutlined />} onClick={() => handleChange('+')} />
        </Space>
    )
}

export default WeekSelector

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