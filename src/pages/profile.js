import React from 'react';
import { connect } from 'react-redux';
import { List, Divider, Input, Form, Button, Checkbox, Spin } from 'antd';

import { user, resolveRules, mergeErrors } from '../util/data'
import { api } from '../util/util';
import { setUser } from '../redux/actions/userActions'


const Profile = (props) => {

    const { id, role, userData } = props

    // React.useEffect(() => {
        
    // }, [userData])

    // const personalDatas = [
    //     {...user.data.fname, value: getIfPresent(user.data.fname.field, userData)},
    //     {...user.data.lname, value: getIfPresent('lname', userData), },
    //     {...user.data.phone, value: getIfPresent('phone', userData), },
    //     {...user.data.email, value: getIfPresent('email', userData), disabled: true},
    //     {...user.data.age, value: getIfPresent('age', userData), },
    // ]

    
    const getData = (dataModel, values, additionalProps) => Object.entries(dataModel).map(([key, val]) => {
        return {...val, value: values.hasOwnProperty(key) ? values[key] : "", ...additionalProps[key]}
    })
    
    const personalData = getData(user.data, userData, {
        email: {disabled: true}
    })

    const personalDataOnSave = (values, callbackRes, callbackErr) => {
        const formatedData = {...values}
        formatedData.fname = formatedData.fname.charAt(0).toUpperCase() + formatedData.fname.slice(1).toLowerCase()
        // console.log(formatedData)

        api.put(`/users/${id}`, {
            user: {
                id: id,
                // user_data: JSON.stringify(formatedData)
                data: formatedData
            }
        // })
        }, {withCredentials: true})
        .then(() => {
            props.setUser(id, role).finally(() => {
                if (callbackRes) callbackRes()
            })
        })
        .catch(err => {
            // console.log(err.response.data)
            if (callbackErr) callbackErr(err.response.data.errors.data)
        })
    }

    // const settingsData = [
    //     {type: 'checkbox', label: 'Newsletter', value: fname,},
    //     {type: 'input', label: 'Last name', value: lname},
    //     {type: 'input', label: 'Phone', value: phone},
    //     {type: 'input', label: 'Email', value: email},
    // ]

    return (
        <>
            <h1>Profile</h1> 
            <DataList 
                data={personalData}
                label='Personal data'
                onSave={personalDataOnSave}
            />
            {/* <DataList 
                data={settingsData}
                label='Settings'
            /> */}
        </>
    )
}

const DataList = (props) => {

    const [form] = Form.useForm();

    React.useEffect(() => {
        form.resetFields()
    }, [props.data, form])
    

    const [errors, setErrors] = React.useState({})
    const [formLoading, setFormLoading] = React.useState(false)
    const [editedFields, setEditedFields] = React.useState({})
    const data = resolveRules(props.data, {errors: errors})
    // console.log('state errors:')
    // console.log(errors)
    const initialValues = Object.fromEntries(data.map(item => [item.field, item.value]))

    const handleChange = (e) => {
        const label = e.target.id
        const value = e.target.value

        if (initialValues[label] === value){
            setEditedFields(prev => {
                const copy = {...prev}
                delete copy[label]
                return copy
            })
        } else {
            setEditedFields(prev => ({...prev, [label]: value}))
        }
    }

    const handleClick = () => {
        setFormLoading(true)
        form.validateFields()
            .then(values => {
                const callbackRes = () => {
                    form.resetFields()
                    setEditedFields({})
                    setFormLoading(false)
                }
                const callbackErr = (err) => {
                    setErrors(prev => mergeErrors(prev, err))
                    form.validateFields()
                    setFormLoading(false)
                }
                props.onSave(values, callbackRes, callbackErr)
            }, err => {
                setFormLoading(false)
                // console.log(err)
            })
            .catch(err => {

                // console.log(err)
            })
    }

    return(
        <div className="data-list-section">
            <Divider orientation="left">{props.label}</Divider>
            <div className="data-list-form">

            <Spin spinning={formLoading}>
                <Form
                    form={form}
                    // className="data-list-form"
                    validateTrigger="onChange"
                    initialValues={initialValues}
                >
                    <List
                        className="data-list-table"
                        bordered
                        itemLayout="horizontal"
                        dataSource={data}
                        renderItem={item => {
                            return (
                                <ListItem
                                item={item}
                                    edited={editedFields.hasOwnProperty(item.field)}
                                    handleChange={(e) => handleChange(e)}/>
                            )
                        }}
                    />
                </Form>
                <div className="data-list-table-footer">
                    <Button 
                        onClick={() => {
                            form.resetFields()
                            setEditedFields({})
                        }}
                        disabled={Object.keys(editedFields).length === 0 ? true : false}
                    >Undo</Button>
                    <Button 
                        onClick={handleClick}
                        type="primary"
                        disabled={Object.keys(editedFields).length === 0 ? true : false}
                    >Save</Button>
                </div>
            </Spin>
            </div>
        </div>
    )
}

const ListItem = (props) => {

    const {item, edited} = props
    
    const rules = (() => {
        if (edited && item.rules){
            return item.rules
        } else {
            return [{validator: async () => edited ? Promise.reject(new Error('Error')) : Promise.resolve()}]
        }
    })()

    const valueField = (() => {
        switch (item.type){
            case 'input': 
                return (
                    <Input
                        className={!edited ? 'data-list-table-input' : null}
                        autoComplete="off"
                        style={{width: '100%'}}
                        disabled={item.disabled}
                    />
                )
            case 'checkbox':
                return (
                    <Checkbox>subscribe</Checkbox>
                )
            default:
                return (
                    <div>no item specified</div>
                )
        }
    })()    

    return (
        <List.Item>
            <div className="data-list-table-item-label">
                {item.label}:
            </div>
            <div className="data-list-table-item-value">
                <Form.Item
                    onChange={props.handleChange}
                    name={item.field}
                    // rules={edited ? (item.rules ? item.rules : null) : null}
                    rules={rules}
                    // validateStatus='error'
                >
                    {valueField}
                </Form.Item>
            </div>                            
        </List.Item>
    )
}

const mapStateToProps = (state) => ({
    id: state.user.id,
    role: state.user.role,
    userData: state.user.data,
})

const mapDispatchToProps = {
    setUser,
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile)