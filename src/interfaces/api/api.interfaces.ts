export interface IGetSettingsAPI {
    start_hour: number,
    end_hour: number,
    time_interval: number,
    working_days: {
        0: true,
        1: true,
        2: true,
        3: true,
        4: true,
        5: false,
        6: false
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
    doc: {
        id: string,
        data: {
            phone: number,
            fname: string,
            lname: string,
            email: string,
            age: number
        },
        settings: {
            newsletter: boolean
        }
    }
}