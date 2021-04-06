import React from 'react';
import {useParams} from 'react-router-dom';
import { connect } from 'react-redux';
import {List, Divider, Input, Form, Button, Checkbox, Spin, Alert} from 'antd';

import { user, resolveRules, mergeErrors } from '../util/data'
import { api } from '../util/util';
import { setUser } from '../redux/actions/userActions'


const Profile = (props) => {
    
    const {userId} = useParams()
    const [userData, setUserData] = React.useState(userId ? {} : props.userData)

    function getUserData(userId){
        api.get(`/users/${userId}`)
        .then(res =>{
            setUserData(res.data.user.data)
        }, err => {
            setUserData({error: 'No user found.'})
            // history.push('/users')
        })
        .catch(err =>{

        })
    }

    React.useEffect(() => {

        if (userId){
            getUserData(userId)
        } else {
            setUserData(props.userData)
        }
        
    }, [userId, setUserData, props.userData])
    
    const id = userId ? userId: props.id
    const role = props.role
    
    const getData = (dataModel, values, additionalProps) => Object.entries(dataModel).map(([key, val]) => {
        return {...val, value: values.hasOwnProperty(key) ? values[key] : "", ...additionalProps[key]}
    })
    
    const personalData = getData(user.data, userData, {
        email: {disabled: true}
    })

    const personalDataOnSave = (values, callbackRes, callbackErr) => {
        const formatedData = {...values}
        formatedData.fname = formatedData.fname.charAt(0).toUpperCase() + formatedData.fname.slice(1).toLowerCase()

        api.put(`/users/${id}`, {
            user: {
                id: id,
                // user_data: JSON.stringify(formatedData)
                data: formatedData
            }
        // })
        }, {withCredentials: true})
        .then(() => {
            if (!userId){
                props.setUser(id, role).finally(() => {
                    setUserData(formatedData)
                    if (callbackRes) callbackRes()
                })
            } else {
                setUserData(formatedData)
                if (callbackRes) callbackRes()
            }
        })
        .catch(err => {
            // console.log(err.response.data)
            if (callbackErr) callbackErr(err.response.data.errors.data)
        })
    }

    const noUserFoundAlert = userData.hasOwnProperty('error') ?
        <Alert className="data-list-alert-bar" message={userData.error} type="error" showIcon />
        : null

    return (
        <>
            <h1>{userId ? `User profile` : 'My profile'}</h1>
            {noUserFoundAlert}
            <Spin spinning={Object.keys(userData).length === 0}>
                <DataList 
                    data={personalData}
                    label='Personal data'
                    onSave={personalDataOnSave}
                />
            </Spin>
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
                    setEditedFields({})
                    // form.resetFields()
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
            })
            .catch(err => {

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