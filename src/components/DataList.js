import React from 'react';
import {List, Divider, Input, Form, Button, Checkbox, Spin} from 'antd';

import {resolveRules, mergeErrors} from '../util/data'


const DataList = (props) => {

    const [form] = Form.useForm();

    React.useEffect(() => {
        form.resetFields()
    }, [props.data, form])
    

    const [errors, setErrors] = React.useState({})
    const [formLoading, setFormLoading] = React.useState(false)
    const [editedFields, setEditedFields] = React.useState({})
    const data = resolveRules(props.data, {errors: errors})

    const initialValues = Object.fromEntries(data.map(item => {
        let value = null
        switch (item.type){
            case 'input':
                value = item.value
                break
            case 'checkbox-list':
                value = Object.entries(item.value).map(([key, val]) => val !== false ? key : null)
                break
            default:
                value = null
        }
        return (
            [item.field, value]
        )
    }))

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

    function formatResults(dataModel, values){
        const results = Object.fromEntries(dataModel.map((item) => {
            let value
            switch (item.type){
                case 'input':
                    value = values[item.field]
                    break
                case 'checkbox-list':
                    value={}
                    for (const [key] of Object.entries(item.value)){
                        
                        value[key] = values[item.field].includes(key) ? true : false
                    }
                    break
                default:
                    value = null
            }

            return [item.field, value]
        }))

        return results
    }

    const handleClick = () => {
        setFormLoading(true)
        form.validateFields()
            .then(values => {

                const formatedValues = formatResults(data, values)
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

                props.onSave(formatedValues, callbackRes, callbackErr)
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

export default DataList

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
            case 'checkbox-list':
                const options = Object.keys(item.value).map((key, index) => {
                    return ({
                        label: item.options[index],
                        value: key,
                    })
                })

                return (
                    <Checkbox.Group className="checkbox-list__wrapper">
                        {options.map((option, index) => 
                            // <Row key={option.label+index}>
                                <Checkbox 
                                    key={option.label+index}
                                    value={option.value}
                                >
                                    {option.label}
                                </Checkbox>
                            // </Row>
                        )}
                    </Checkbox.Group>
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
