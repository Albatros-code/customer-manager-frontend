import { Form, Radio, Space} from 'antd';

import {generateTimeTableBase} from '../util/appointments'

const HourSelector = (props) => {
    
    const {
        selectedDate,

        handleMinutesChange,
        handleHourChange,
        disabledMinutes,
        disabledHour,
        
        startHour, endHour, timeInterval
    } = props

    const timeTableBase = generateTimeTableBase(selectedDate, startHour, endHour, timeInterval)

    return (
        <Form.Item
            className="time-selector-form-item"
            name="timeHour"
            rules={[
                { required: true, message: 'Please select hour!' },
            ]}
            >
            <Radio.Group  className="time-selector-radio-group" onChange={(e) => handleHourChange(e.target.value)}>
                {timeTableBase.map(({hour, minutes }, index) => {
                    return(
                        <Space  className="time-selector-space-row" direction="horizontal" key={"space"+index}>
                            <Radio.Button disabled={disabledHour(hour)} className="time-button" key={"hour"+index} value={hour.format('HH')}>{hour.format('HH')}</Radio.Button>
                            <Form.Item  name="timeMinutes" style={{marginBottom: 0}}>
                                <Radio.Group className="minutes-selector" onChange={(e) => {handleMinutesChange(e.target.value)}}>
                                    {minutes.map((itemMinute, indexMinute) => (
                                        <Radio.Button disabled={disabledMinutes(itemMinute)} key={"minute"+index+"_"+indexMinute} value={itemMinute.format('HH:mm')}>{itemMinute.format('mm')}</Radio.Button>
                                        ))}
                                </Radio.Group>
                            </Form.Item>
                        </Space>
                    )
                })}
            </Radio.Group>
        </Form.Item>
    )
}

export default HourSelector