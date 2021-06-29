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
    name: string,
    service:string,
    price: number
}

export type IDatabaseDoc = IAppointmentDoc | IServiceDoc | IUserDoc | IUserDataDoc | IUserSettingsDoc