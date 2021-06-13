import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

import dataReducer from './slices/dataSlice';
import userReducer from './slices/userSlice';
import uiReducer from './slices/uiSlice';


const preloadedState = {};

const reducer = {
    data: dataReducer,
    user: userReducer,
    ui: uiReducer,
};

const store = configureStore({
  reducer : reducer,
  preloadedState: preloadedState,
  devTools: process.env.NODE_ENV !== 'production',
})

export default store;

export type RootState = ReturnType<typeof store.getState>
// TODO: figure out any type 
export type AppDispatch = typeof store.dispatch | any

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector