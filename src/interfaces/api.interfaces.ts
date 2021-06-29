import { 
    IAppointmentDoc,
    IUserDoc
} from './doc.interfaces'


export interface IGetAppointments {
    total: number,
    data: IAppointmentDoc[]
}


export const working_days_keys = [0, 1, 2, 3, 4, 5, 6]

export interface IGetSettingsAPI {
    start_hour: number,
    end_hour: number,
    time_interval: number,
    working_days: {
        0: boolean,
        1: boolean,
        2: boolean,
        3: boolean,
        4: boolean,
        5: boolean,
        6: boolean,
        // [key: number]: boolean
    }
}


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