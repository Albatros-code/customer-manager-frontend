import { createSlice } from '@reduxjs/toolkit'

// types
import { RootState } from '../store'


interface IUIReduxState {
    loading: boolean,
}

const initialState: IUIReduxState = {
    loading: true,
}

export const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        LOADING_UI: (state) => {
            state.loading = true
        },
        stopLoadingUi: (state) => {
            state.loading = false
        },
    }
})

export const {LOADING_UI, stopLoadingUi} = uiSlice.actions

export default uiSlice.reducer

export const selectUI = (state: RootState) => state.ui