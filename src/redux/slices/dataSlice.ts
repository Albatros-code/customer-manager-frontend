import { createSlice } from '@reduxjs/toolkit'

import { api } from '../../util/util'

import { AnyAction } from 'redux'
import { ThunkAction } from 'redux-thunk'

// types
import { PayloadAction } from '@reduxjs/toolkit'
import { AxiosResponse } from 'axios'
import { RootState } from '../store'
import { IGetSettingsAPI, IGetServicesAPI } from '../../interfaces'


interface IDataReduxState {
    services: IGetServicesAPI["data"] | undefined
    avaiableDates: Array<any> | undefined,
    settings: IGetSettingsAPI | undefined
}

const initialState: IDataReduxState = {
    services: undefined,
    avaiableDates: undefined,
    settings: undefined,
}

export const dataSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
        SET_SETTINGS: (state, action: PayloadAction<IDataReduxState['settings']>) => {
            state.settings = action.payload
        },
        SET_SERVICES: (state, action: PayloadAction<IDataReduxState['services']>) => {
            state.services = action.payload
        },
        SET_AVAILABLE_DATES: (state, action) => {
            state.avaiableDates = action.payload
        },
    }
})

export const {SET_SETTINGS, SET_SERVICES, SET_AVAILABLE_DATES} = dataSlice.actions

export default dataSlice.reducer

export const selectData = (state: RootState) => state.data

export const fetchSettings = (): ThunkAction<Promise<AxiosResponse<IGetSettingsAPI>>, RootState, unknown, AnyAction> => 
// export const fetchSettings = (): ThunkAction<void, RootState, unknown, AnyAction> => 
    async (dispatch) => {
        return new Promise(async (resolve, reject) => {
            try {
                const fetchedData = await api.get<IGetSettingsAPI>('/settings')
                dispatch(SET_SETTINGS(fetchedData.data))
                resolve(fetchedData)
            } catch (err) {
                reject(err)
            }
        })
}

export const fetchServices = (): ThunkAction<Promise<AxiosResponse<IGetServicesAPI>>, RootState, unknown, AnyAction> => 
    (dispatch) => {
        return new Promise(async (resolve, reject) => {
            try {
                const fetchedData = await api.get<IGetServicesAPI>('/services')
                dispatch(SET_SERVICES(fetchedData.data.data))
                resolve(fetchedData)
            } catch (err) {
                reject(err)
            }
        })
}