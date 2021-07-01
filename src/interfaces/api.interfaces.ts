import { 
    IAppointmentDoc,
    IUserDoc,
    ISettingDoc,
} from './doc.interfaces'


export interface IGetAppointments {
    total: number,
    data: IAppointmentDoc[]
}


export const working_days_keys = [0, 1, 2, 3, 4, 5, 6]

export interface IGetSettingsAPI extends ISettingDoc { }


export interface IGetServicesAPI {
    total: number,
    data: Array<{
        id: string,
        name: string,
        duration: number,
        price: number,
    }>
}

export interface IGetAvailableHoursAPI {
    slots: {
        [date: string]: {
            [hour: number]: {
                [minuteInterval: number]: boolean
            }
        },
        
    },
    date_range: string
}

export interface ITokenRefreshAPI {
    access_token: string
}

export interface IDecodedJWT {
    iat: number,
    exp: number,
    sub: {
        id: string,
        role: string,
    }
}

export interface IUsersIDAPI {
    doc: IUserDoc
}

export interface IGetUsersIDAppointmentsAPI {
    total: number,
    data: IAppointmentDoc[]
}

export interface IGetAppointmentsAPI {
    slots: {
        [date: string]: {
            [hour: number]: {
                [minuteInterval: number]: boolean
            }
        },
        
    },
    date_range: string
}

// TODO: check backend data
export interface IGetApointmentsScheduleAPI {
    date_range: string,
    appointments: (IAppointmentDoc & {user_name: string, phone: string,})[]
    // appointments: {
    //     id: string,
    //     service: string,
    //     date: string,
    //     duration: number,
    //     user: string,
    //     user_name: string,
    //     phone: string,
    // }[]
}