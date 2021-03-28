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
    username: 'username',
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
                // {pattern: new RegExp("^\\d{9}$"), message: "Phone number should have 9 digit."},
                (errors) => {return apiErrorValidator(errors)},
            ]
        },
        email: {
            field: 'email',
            label: 'Email',
            type: 'input',
            rules: [
                {required: true, message: "Can't be blank!" },
                { type: 'email', message: "The input is not valid E-mail!"},
                (errors) => {return apiErrorValidator(errors)},
            ]
        },
        age: {
            field: 'age',
            label: 'Age',
            type: 'input',
            rules: [
                {required: true, message: "Can't be blank!" },
                // {pattern: new RegExp("^\\d{2}$"), message: "Not valid age."},
                (errors) => {return apiErrorValidator(errors)},
            ]
        },        
    },
    settings: {
        newsletter: 'boolean',
    }
}


