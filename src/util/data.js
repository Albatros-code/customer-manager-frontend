import React from 'react';
import {DataListDataSelector} from "../components/DataSelector"

/*
error response
{
    errors: {
        field_name: {
            value: message
        }
    }
}
*/

export const getData = (dataModel, values, additionalProps) => Object.entries(dataModel).map(([key, val]) => {
    // const valueToShow = val.hasOwnProperty("valueToShow") && values.hasOwnProperty(key) ? {valueToShow: useValueToShow(val.valueToShow(values[key]))} : {}
    return {
        value: values.hasOwnProperty(key) ? values[key] : "",
        ...val,
        ...additionalProps[key],
        // ...valueToShow
    }
})

export const mergeErrors = (prevs, errs) => {
    const prevsCopy = JSON.parse(JSON.stringify(prevs))
    for (const [key, val] of Object.entries(errs)) {
        prevsCopy[key] = {...prevsCopy[key], ...val}
    }
    return prevsCopy
}

const apiErrorValidator = (errors) => {
    const validator = async (rule, value) => {
        if (errors.hasOwnProperty(rule.field) && errors[rule.field].hasOwnProperty([value])) {
            return Promise.reject(new Error(errors[rule.field][value]))
        } else {
            return Promise.resolve()
        }
    }
    return {validator: validator}
}

export const resolveRules = (data, {errors}) => {
    return data.map(item => {
        if (item.rules){
            const rulesResolved = item.rules.map(rule => {
                if (typeof(rule) === 'function'){
                    return rule(errors)
                } else {
                    return rule
                }
            })

            return {...item, rules: rulesResolved}            
        } else {
            return item
        }
    })
}

export const user = {
    username:  {
        field: 'username',
        label: 'Username',
        type: 'input',
        rules: [
            {required: true, message: "Can't be blank!" },
            {pattern: new RegExp("^(?=[a-zA-Z0-9._]{8,20}$)(?!.*[_.]{2})[^_.].*[^_.]$"), message: "Not valid input."},
            (errors) => {return apiErrorValidator(errors)},

        ]
    },
    password:  {
        field: 'password',
        label: 'Password',
        type: 'input',
        rules: [
            {required: true, message: "Can't be blank!" },
            {min: 8, message: 'The password must contain at least 8 character'},
            (errors) => {return apiErrorValidator(errors)},

        ]
    },
    confirmPassword:  {
        field: 'confirmPassword',
        label: 'Confirm Password',
        type: 'input',
        rules: [
            {required: true, message: "Please confirm your password!" },
            // {min: 8, message: 'The password must contain at least 8 character'},
            (errors) => {return apiErrorValidator(errors)},
            () => ({getFieldValue}) => ({
                validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                }
                return Promise.reject('Passwords do not match!');
                },
            }),
        ]
    },
    data: {
        fname: {
            field: 'fname',
            label: 'First name',
            type: 'input',
            rules: [
                {required: true, message: "Can't be blank!" },
                {pattern: new RegExp("^[A-Za-z]*$"), message: "Not valid input."},
                (errors) => {return apiErrorValidator(errors)},

            ]
        },
        lname: {
            field: 'lname',
            label: 'Last name',
            type: 'input',
            rules: [
                {required: true, message: "Can't be blank!" },
                // {pattern: new RegExp("^[A-Za-z]*$"), message: "Not valid input."},
                {pattern: new RegExp("^[A-Za-z]+$|^[A-Za-z]+-[A-Za-z]+$"), message: "Not valid input."},
                (errors) => {return apiErrorValidator(errors)},
            ]
        },
        phone: {
            field: 'phone',
            label: 'Phone',
            type: 'input',
            rules: [
                {required: true, message: "Can't be blank!" },
                {pattern: new RegExp("^\\d{9}$"), message: "Phone number should have 9 digit."},
                (errors) => {return apiErrorValidator(errors)},
            ]
        },
        email: {
            field: 'email',
            label: 'Email',
            type: 'input',
            rules: [
                {required: true, message: "Can't be blank!" },
                {type: 'email', message: "The input is not valid E-mail!"},
                (errors) => {return apiErrorValidator(errors)},
            ]
        },
        age: {
            field: 'age',
            label: 'Age',
            type: 'input',
            rules: [
                {required: true, message: "Can't be blank!" },
                {pattern: new RegExp("^\\d{2}$"), message: "Not valid age."},
                (errors) => {return apiErrorValidator(errors)},
            ]
        },        
    },
    settings: {
        newsletter: 'boolean',
    }
}

export const settingsModel = {
    start_hour: {
        field: 'start_hour',
        label: 'Start hour',
        type: 'input',
        rules: [
            {required: true, message: "Can't be blank!" },
            {pattern: new RegExp("^\\d{2}$"), message: "Not valid hour."},
            (errors) => {return apiErrorValidator(errors)},
        ]
    },
    end_hour: {
        field: 'end_hour',
        label: 'End hour',
        type: 'input',
        rules: [
            {required: true, message: "Can't be blank!" },
            {pattern: new RegExp("^\\d{2}$"), message: "Not valid hour."},
            (errors) => {return apiErrorValidator(errors)},
        ]
    },
    time_interval: {
        field: 'time_interval',
        label: 'Time interval',
        type: 'input',
        rules: [
            {required: true, message: "Can't be blank!" },
            {pattern: new RegExp("^\\d{2}$"), message: "Not valid minutes."},
            (errors) => {return apiErrorValidator(errors)},
        ]
    },
    working_days: {
        field: 'working_days',
        label: 'Working days',
        type: 'checkbox-list',
        options: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        rules: [
            {required: true, message: "Can't be blank!" },
            {pattern: new RegExp("^\\d{2}$"), message: "Not valid minutes."},
            (errors) => {return apiErrorValidator(errors)},
        ]
    },
}

export const appointmentModel = {
    user: {
        field: 'user',
        label: 'User',
        type: 'custom',
        component: (record, handleChange, isEdited) => (
            <DataListDataSelector
                record={record}
                handleChange={handleChange}
                isEdited={isEdited}
                dataUrl={'/users'}
                displayData={(doc) => doc.data.lname + ' ' + doc.data.fname}
                queryField={'data__lname'}
            />
        ),
        rules: [
            {required: true, message: "Can't be blank!" },
            (errors) => {return apiErrorValidator(errors)},
        ]
    },
    service: {
        field: 'service',
        label: 'Service',
        type: 'custom',
        rules: [
            {required: true, message: "Can't be blank!" },
            (errors) => {return apiErrorValidator(errors)},
        ],
        component: (record, handleChange, isEdited) => (
            <DataListDataSelector
                record={record}
                handleChange={handleChange}
                isEdited={isEdited}
                dataUrl={'/services-admin'}
                displayData={(doc) => doc.name}
                queryField={'name'}
            />
        ),
    },
    date: {
        field: 'date',
        label: 'Date',
        type: 'date',
        rules: [
            {required: true, message: "Can't be blank!" },
            (errors) => {return apiErrorValidator(errors)},
        ]
    },
    duration: {
        field: 'duration',
        label: 'Duration',
        type: 'input',
        rules: [
            {required: true, message: "Can't be blank!" },
            (errors) => {return apiErrorValidator(errors)},
            {validator: async (rule, value) => {
                const parsedVal = parseInt(value)
                if (String(parsedVal) === value || value === '') {
                    return Promise.resolve()
                } else {
                    return Promise.reject(new Error('Not valid number.'))
                }
            }}
        ]
    },
}

