export interface IUserDoc {
    id: string,
    data: IUserDataDoc,
    settings: IUserSettingsDoc,
}

export interface IUserDataDoc {
    phone: number,
    fname: string,
    lname: string,
    email: string,
    age: number,
}

export interface IUserSettingsDoc {
    newsletter: boolean,
}

export interface IAppointmentDoc {
    id: string,
    user: string,
    service:string,
    service_name: string,
    date: string,
    duration: number,
}

export interface IServiceDoc {
    id: string,
    name: string,
    service:string,
    price: number
}

export interface ISettingDoc {
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
    }
}

export type IDatabaseDoc = IAppointmentDoc | IServiceDoc | IUserDoc | IUserDataDoc | IUserSettingsDoc | ISettingDoc