// redux
import { useAppDispatch, useAppSelector } from '../redux/store';
import { fetchSettings, selectData } from '../redux/slices/dataSlice';

import DataList from '../components/DataList';
import {getData, settingsModel} from '../util/data';
import {api} from '../util/util'

// type
import { ISettingDoc } from '../interfaces';
import { OnSaveFunc } from '../components/DataList';

const Settings = () => {

    const dispatch = useAppDispatch()
    const { settings } = useAppSelector(selectData)

    const settingsData = getData(settingsModel, settings, {})

    const settingsOnSave: OnSaveFunc<ISettingDoc> = (values, callbackRes, callbackErr) => {

        api.put(`/settings`, {
            settings: values
        }, {withCredentials: true})
        .then(() => {
            dispatch(fetchSettings()).finally(() => {
                if (callbackRes) callbackRes()
            })            
        })
        .catch(err => {
            if (callbackErr) callbackErr(err.response.data.errors)
        })
    }

    return (
        <>
            <h1>Settings</h1>
            <p>You can change settings here.</p>
            <DataList 
                data={settingsData}
                label='Appointments availability'
                onSave={settingsOnSave}
            />
        </>
    )
}

export default Settings