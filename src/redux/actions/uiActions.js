import {
    LOADING_UI,
    STOP_LOADING_UI
} from '../types'

export const setLoadingUi = () => ({
    type: LOADING_UI
})

export const stopLoadingUi = () => ({
    type: STOP_LOADING_UI
})