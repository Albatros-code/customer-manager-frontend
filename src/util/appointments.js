import {dayjsExtended as dayjs} from '../util/util'

export function generateTimeTableBase(dateObj, startHour, endHour, intervalMinutes){

    const start = dateObj.set({hour: startHour, minute: 0, second: 0, millisecond: 0})
    const end = dateObj.set({hour: endHour-1, minute: 59, second: 59, millisecond: 999})

    let array = []
    let current = dayjs(start)
    do {

        let minutesArray = []
        let minutes = 0
        do {
            minutesArray.push(current.set({minute: minutes}))
            minutes = minutes + intervalMinutes
        } while (minutes < 60)

        let item = {
            hour: current,
            minutes: minutesArray,
        }

        array.push(item)
        current = current.add(1, 'hour')
        
        } while (current < end);
    return array
}

export function currentWeekString(dayObj, accuracy){
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