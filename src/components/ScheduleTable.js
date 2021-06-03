import React from 'react';
import {Modal} from 'antd';

import {ItemDetails} from '../components/DatabaseTable'
import {generateTimeTableBase} from '../util/appointments'
// import { dayjsExtended as dayjs } from '../util/util'


export const ScheduleTable = (props) => {
    const startHour = props.startHour ? props.startHour : 12
    const endHour = props.endHour ? props.endHour :20
    const timeInterval = props.timeInterval ? props.timeInterval : 15
    
    const rowHeight = 100
    const {selectedDate} = props

    const timeTable = <div className={"schedule-table-board"}>
        {generateTimeTableBase(selectedDate, startHour, endHour, timeInterval)
        .map((item, index) => {
            const hourSlotHeight = rowHeight + 'px'
            return (
                <div 
                    className="schedule-table-hour"
                    style={{height: hourSlotHeight}}
                    key={'sth'+index}   
                >
                    {item.hour.format('HH')}
                    <div className="schedule-table-minutes">
                        {item.minutes.map((minute, index) => {
                            if (item.minutes.length === index + 1){
                                return null
                            }
                            const minuteSlotHeight = `${100/(item.minutes.length)}%`
                            return (
                                <div
                                    className="schedule-table-minutes-item"
                                    key={minute}
                                    style={{height: minuteSlotHeight}}
                                >
                                </div>
                            )
                        })}
                    </div>
                </div>
            )
        })}
    </div>

    const dummyItems = (() => {
        const dummyItem = 
            <ScheduleItem
                date={selectedDate.set({hour: endHour+1})}
                duration={5}
            >
                {null}
            </ScheduleItem>
        
        const array = []
        for (let i=0; i<20; i++){
            array.push(dummyItem)
        }
        return array
    })()

    return (
        <div className="schedule-table-wrapper schedule-table-form">
            {timeTable}
            {props.items.concat(dummyItems).map((child, index) => {
                if (child.type === ScheduleItem){
                    return React.cloneElement(child, {key: index, startHour: startHour, timeInterval: timeInterval})
                } else {
                    return null
                }
            })}
        </div>
    )
}

export const ScheduleItemDetails = (props) => {

    const {visible, setVisible, details} = props

    return (
        <Modal 
            title="Appointment Details"
            centered
            visible={visible}
            onCancel={() => {setVisible(prev=>!prev)}}
            footer={null}
        >
            {details(setVisible)}
      </Modal>
    )
}

export const ScheduleItem = (props) => {

    const rowHeight = 100
    const {key, date, duration, details, record} = props
    const {startHour} = props
    
    const itemPosition = `${((parseInt(date.format('HH')) - startHour) + parseInt(date.format('mm'))/60)  * rowHeight}px`
    const itemHeight = `${duration/60 * rowHeight}px`

    const [detailsVisible, setDetailsVisible] = React.useState(false)
    const handleClick = () => {
        setDetailsVisible(1)
    }

    return (
        <div
            className="schedule-item-wrapper"
            key={'appointment' + key} 
            style={{top: itemPosition, height: itemHeight}}
        >
            <div onClick={handleClick} className="schedule-item-frame">
                <div className="schedule-item-label">
                    {date.format('HH:mm')}
                </div>
                <div className="schedule-item-container"
                    style={{
                        alignItems: parseInt(itemHeight) <= 50 ? 'flex-start' : 'center'
                    }}
                >
                    {props.children}
                </div>
            </div>
            <ItemDetails 
                visible={detailsVisible}
                setVisible={setDetailsVisible}
                details={details}
                record={record}
            />
        </div>
    )
}

export default ScheduleTable

