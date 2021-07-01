import React from 'react';
import { Spin, Form } from 'antd';

import { api, dayjsExtended as dayjs } from '../util/util'
import { currentWeekString } from '../util/appointments'

// components
import FormWrapper from '../components/FormWrapper';
import DaySelector from '../components/daySelector';
import WeekSelector from '../components/WeekSelector';
import {ScheduleTable, ScheduleItem} from '../components/ScheduleTable';
import AppointmentsDetails from '../components/AppointmentsDetails';
import {DatabaseTableContext} from '../components/DatabaseTable';

// redux
import { useAppSelector } from "../redux/store";
import { selectData } from "../redux/slices/dataSlice";

// types
import { IGetApointmentsScheduleAPI } from '../interfaces';
import { Dayjs } from 'dayjs';

interface IAppointmentsData {
    [dateRange: string]: IGetApointmentsScheduleAPI['appointments']
}

const AdminSchedule = () => {

    const {services} = useAppSelector(selectData)
    const { settings } = useAppSelector(selectData)
    const startHour = settings?.start_hour
    const endHour = settings?.end_hour
    const timeInterval = settings?.time_interval

    const [ selectedDate, setSelectedDate ] = React.useState(dayjs.tz(dayjs()).set({second: 0, millisecond: 0}))
    const [ appointmentsData, setAppointmentsData ] = React.useState<IAppointmentsData>({})
    
    const appointments = (() => {
        if (appointmentsData.hasOwnProperty(currentWeekString(selectedDate))){
            return appointmentsData[currentWeekString(selectedDate)].filter(appointment => {
                const date = dayjs(appointment.date)
                return date.format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD')
            })
        } else {
            return []
        }
    })()

    function getAppointments(startDate: string, endDate: string){
        
        api.get<IGetApointmentsScheduleAPI>('/appointments-schedule', {
            params: {
                start_date: startDate,
                end_date: endDate,
        }})
            .then(res => {
                setAppointmentsData((prev) => ({...prev, [res.data.date_range]: res.data.appointments}))
            }, err => {})
            .catch(err => {})
    }
    
    const getData = React.useCallback(() => {
        const startDate = selectedDate.startOf('week')
        const endDate = selectedDate.endOf('week')
        const condition = true ? !appointmentsData.hasOwnProperty(`${startDate.format('YYYY-MM-DD')}:${endDate.format('YYYY-MM-DD')}`) : true
        if (condition){ 
            getAppointments(startDate.toISOString(), endDate.toISOString())
        }
    }, [appointmentsData, selectedDate])

    React.useEffect(() => {
        getData()
    },[appointmentsData, getData, selectedDate])

    const [form] = Form.useForm()
    
    const handleDayChange = (newWeekDay: number) => {
        setSelectedDate(prev => prev.weekday(newWeekDay))
    }
    
    const handleWeekChange = (dayObj: Dayjs) => {
        setSelectedDate(dayObj)
        form.setFieldsValue({"day": dayObj.weekday()})
    }
    
    const weekSelector =
    <WeekSelector
        handleWeekChange={handleWeekChange}
        selectedDate={selectedDate}
        disabledButtonLeft={false}
        disabledButtonRight={false}
    />
    
    const daySelector = 
    <DaySelector
        handleDayChange={handleDayChange}
        selectedDate={selectedDate}
        disabledButton={false}
    />

    function getServiceName(doc: IGetApointmentsScheduleAPI['appointments'][number]){
        const serviceDoc = services ? services.find((item) => item.id === doc.service) : null
        return serviceDoc ? serviceDoc.name : "deleted " + doc.service
    }

    const appointmentCardContent = (appointment: IGetApointmentsScheduleAPI['appointments'][number]) => {
        return (
            <div className="schedule-table-appointment-card">
                <p>{getServiceName(appointment)}</p>
                <p>{appointment.user_name}</p>
                <p>{appointment.phone}</p>
            </div>
        )
    }

    // const itemDetails = (record: IGetApointmentsScheduleAPI['appointments'][number], setVisible: React.Dispatch<React.SetStateAction<boolean>>) => {
    const itemDetails = (record: IGetApointmentsScheduleAPI['appointments'][number], setVisible: React.Dispatch<React.SetStateAction<boolean>>):React.ReactNode => {
        if (!record) return null
        
        const title = getServiceName(record) + ' on ' + dayjs(record.date).tz().format('DD-MM-YYYY')

        return ([
            <AppointmentsDetails 
                doc={record}
                setVisible={setVisible}
            />,
                title
        ])
    } 
    
    const appointmentCards = appointments.map((item) => {
        return (
            <ScheduleItem
                startHour={startHour ? startHour : 12}
                date={dayjs(item.date)}
                duration={item.duration}
                key={item.id}
                record={item}
                details={itemDetails}
            >
                {appointmentCardContent(item)}
            </ScheduleItem>
        )
    })
    
    return (
        <>
            <h1>Appointments</h1>
            <FormWrapper
                className="schedule-table-form"
                form={form}
                initialValues={{ day: selectedDate.weekday()}}
            >
                {weekSelector}
                {daySelector}
            </FormWrapper>

            <Spin spinning={ !appointmentsData.hasOwnProperty(currentWeekString(selectedDate)) && appointments.length === 0}>
                <DatabaseTableContext.Provider value={{
                    updateTableContent: getData
                }}>
                    <ScheduleTable
                        startHour={startHour}
                        endHour={endHour}
                        timeInterval={timeInterval}
                        selectedDate={selectedDate}
                        items={appointmentCards}
                    />
                        {/* {appointmentCards}
                    </ScheduleTable> */}
                </DatabaseTableContext.Provider>
            </Spin>
        </>
    )
}


export default AdminSchedule
