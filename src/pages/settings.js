// redux
import { useAppDispatch, useAppSelector } from '../redux/store';
import { fetchSettings, selectData } from '../redux/slices/dataSlice';

import DataList from '../components/DataList';
import {getData, settingsModel} from '../util/data';
import {api} from '../util/util'

const Settings = (props) => {

    const dispatch = useAppDispatch()
    const { settings } = useAppSelector(selectData)

    const settingsData = getData(settingsModel, settings, {})

    const settingsOnSave = (values, callbackRes, callbackErr) => {
        const formatedData = {
            ...values,
            start_hour: parseInt(values.start_hour),
            end_hour: parseInt(values.end_hour),
            time_interval: parseInt(values.time_interval)
        }

        api.put(`/settings`, {
            settings: formatedData
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