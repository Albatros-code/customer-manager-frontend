import React from 'react';
import {Modal} from 'antd';

import {ItemDetails} from './DatabaseTable'
import {generateTimeTableBase} from '../util/appointments'
import { Dayjs } from 'dayjs';

interface IScheduleTable {
    startHour: number,
    endHour: number,
    timeInterval: number,
    selectedDate: Dayjs,
    items: React.FunctionComponentElement<typeof ScheduleItem>[]
}

const defaultProps = {
    startHour: 12,
    endHour: 20,
    timeInterval: 15,
}

export const ScheduleTable = (props: IScheduleTable) => {

    const { startHour, endHour, timeInterval, selectedDate } = props
    
    const rowHeight = 100

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
                                    key={minute.toISOString()}
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
                key={'string'}
                startHour={1}
                details={() => <p>none</p>}
                record={{}}
            >
                {<p></p>}
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
            {/* {props.items.concat(dummyItems).map((child: React.FunctionComponentElement<typeof ScheduleItem>, index: number) => { */}
            {props.items.concat(dummyItems).map((child: any, index: number) => {
                if (child.type === ScheduleItem){
                    return React.cloneElement(child, {key: index, startHour: startHour, timeInterval: timeInterval})
                } else {
                    return null
                }
            })}
        </div>
    )
}

interface IScheduleItemDetails {
    visible: boolean,
    setVisible: React.Dispatch<React.SetStateAction<boolean>>,
    details: (setVisible: React.Dispatch<React.SetStateAction<boolean>>) => React.ReactNode
}

export const ScheduleItemDetails = (props: IScheduleItemDetails) => {

    const {visible, setVisible, details} = props

    return (
        <Modal 
            title="Appointment Details"
            centered
            visible={visible}
            onCancel={() => {setVisible(prev => !prev)}}
            footer={null}
        >
            {details(setVisible)}
      </Modal>
    )
}

interface IScheduleItem {
    key: string,
    date: Dayjs,
    duration: number,
    startHour: number,
    details: (setVisible: (visible: boolean) => void) => JSX.Element
    record: any,
    children: JSX.Element
}

export const ScheduleItem = (props: IScheduleItem) => {

    const rowHeight = 100
    const {key, date, duration, details, record} = props
    const {startHour} = props
    
    const itemPosition = `${((parseInt(date.format('HH')) - startHour) + parseInt(date.format('mm'))/60)  * rowHeight}px`
    const itemHeight = `${duration/60 * rowHeight}px`

    const [detailsVisible, setDetailsVisible] = React.useState<number | undefined>(undefined)
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


ScheduleTable.defaultProps = defaultProps

export default ScheduleTable

