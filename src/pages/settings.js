import React from 'react';
import {connect} from 'react-redux';

import {setSettings} from '../redux/actions/dataActions'

import DataList from '../components/DataList';
import {getData, settingsModel} from '../util/data';
import {api} from '../util/util'

const Settings = (props) => {

    const settingsData = getData(settingsModel, props.settings, {})

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
            props.setSettings().finally(() => {
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

const mapStateToProps = (state) => ({
    id: state.user.id,
    role: state.user.role,
    settings: state.data.settings,

})

const mapDispatchToProps = {
    setSettings
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)