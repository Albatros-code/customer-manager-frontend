import React from 'react';
import moment from 'moment-timezone';
import { Spin } from 'antd';

// redux
import { connect } from 'react-redux';
import { getServices } from '../redux/actions/dataActions';

import { api } from '../util/util'

import DaySelector from '../components/daySelector'

const AdminAppointments = (props) => {

    const rowHeight = 100

    const {services} = props
    const {getServices} = props

    const [ selectedDate, setSelectedDate ] = React.useState(moment.tz(new Date(),'Europe/Warsaw').set({'second': 0, 'millisecond': 0}))
    const [ appointmentsData, setAppointmentsData ] = React.useState({})

    React.useEffect(() => {
        getServices()
    // eslint-disable-next-line react-hooks/exhaustive-deps  
    }, []) 

    React.useEffect(() => {
        // fetch user history data
        const weekString = getWeekString(selectedDate)

        if(!appointmentsData.hasOwnProperty(weekString)){
            console.log('fetching appointments from ' + weekString)
            api.get('/appointments', 
                { params: {
                    start_date: getWeekStartDate(selectedDate).toISOString(),
                    end_date: getWeekEndDate(selectedDate).toISOString(),
                }},
                {withCredentials: true})
            .then(res => {
                console.log(res)
                setAppointmentsData(prev => prev ? {...prev, [weekString]: res.data} : {[weekString]: res.data})
            }, err => {
                console.log(err.response.data)
            })
            .catch(err => {
                console.log(err)
            })
        }
        
    },[setAppointmentsData, selectedDate, appointmentsData])

    const appointments = appointmentsData.hasOwnProperty([getWeekString(selectedDate)]) ? appointmentsData[getWeekString(selectedDate)].map((item, index) => {
        const date = moment(item.date)
        if (date.format('YYYY-MM-DD') !== selectedDate.format('YYYY-MM-DD')) return null
        const service = services.find(s => s.name === item.service)
        // const rowHeight = rowHeight
        return (
            <div
                key={'appointment' + index} 
                style={{
                    position: 'absolute',
                    // background: 'red',
                    top: `${((parseInt(date.format('HH')) - 12) + parseInt(date.format('mm'))/60)  * rowHeight}px`,
                    right: '0',
                    width: '85%',
                    height: `${item.duration/60 * rowHeight}px`,
                    textAlign: 'center',
                    padding: '3px',
            }}>
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        background: 'white',
                        border: '1px solid #1890ff',
                        borderRadius: '3px',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'stretch',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            // borderRight: '1px solid #1890ff',
                            background: '#e6f7ff',
                            width: '50px',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {date.format('HH:mm')}
                    </div>
                    <div
                        style={{
                            width: '100%',
                        }}
                    >
                        {service.name}
                    </div>
                </div>
            </div>
        )
    }) : null

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

    const timeTable = <div style={{marginBottom: '1rem'}}>
        {generateTimeTableBase(selectedDate, 12, 20, 15)
        .map((item, index) => {
            item.minutes.pop()

            return (
                    <div
                        style={{
                            background: 'white',
                            borderBottom: '1px solid #d9d9d9',
                            height: rowHeight + 'px',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                        key={'timeTable' + index}
                    >
                        {item.hour.format('HH:mm')}
                        <div
                            style={{
                                background: 'white',
                                // borderBottom: '1px solid #d9d9d9',
                                height: '100%',
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-end',
                                justifyContent: 'flex-start',

                            }}>{
                            item.minutes.map((minute) => {

                                return (
                                    <div
                                        key={minute}
                                        style={{
                                            background: 'white',
                                            borderBottom: '1px solid #d9d9d9',
                                            height: `${100/(item.minutes.length + 1)}%`,
                                            width: 'calc(100% - 10px)',
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}>
                                            {/* {item} */}
                                    </div>
                                )
                            })
                            }
                        </div>

                    </div>
                )
        })}
    </div>

    return (
        <>
            <h1>Appointments</h1>
            {/* <p><strong>Appointments selected date:</strong> {selectedDate.format('YYYY-MM-DD HH-mm-ss')}</p> */}

            <DaySelector
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
            />
            <Spin spinning={!appointments}>
                <div style={{
                    position: 'relative'
                }}>
                    {timeTable}
                    {appointments}
                </div>
            </Spin>
        </>
    )
}

const mapStateToProps = (state) => ({
    services: state.data.services,
})

const mapDispatchToProps = {
    getServices,
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminAppointments)


function getWeekStartDate(dateObj){
    return (moment(dateObj).day(1)).set({'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0})
}

function getWeekEndDate(dateObj){
    return (moment(dateObj).day(7)).set({'hour': 23, 'minute': 59, 'second': 59, 'millisecond': 0})
}

function getWeekString(dateObj){
    const startDate = getWeekStartDate(dateObj)
    const endDate = getWeekEndDate(dateObj)
    return startDate.format('YYYY-MM-DD') + ':' + endDate.format('YYYY-MM-DD')
}