import React from 'react';
import {List, Divider, Input, Form, Button, Checkbox, Spin} from 'antd';
import {DatePicker} from 'antd';
// import DatePicker from '../components/antd-dayjs/DatePicker'

import {resolveRules, mergeErrors} from '../util/data'
import moment from 'moment';
// import {dayjsExtended as dayjs} from '../util/util'

export const DataListContext = React.createContext([]);

export const useDataListContext = () => React.useContext(DataListContext);

const DataList = (props) => {
    
    const [form] = Form.useForm();

    // React.useEffect(() => {
    //     form.resetFields()
    // }, [props.data, form])
    

    const [errors, setErrors] = React.useState({})
    const [formLoading, setFormLoading] = React.useState(false)
    const [editedFields, setEditedFields] = React.useState({})
    const data = resolveRules(props.data, {errors: errors})
    
    const initialValues = Object.fromEntries(data.map(item => {
        let value = null
        switch (item.type){
            case 'custom':
                // value = item.hasOwnProperty('valueToShow') ? item.valueToShow : item.value
                value = item.value
                break
            case 'input':
                // value = item.hasOwnProperty('valueToShow') ? item.valueToShow : item.value
                value = item.value
                break
            case 'date':
                // value = moment(item.value)
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
        if (e.target.id.includes('skip')) return
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
                case 'custom':
                    value = values[item.field]
                    break
                case 'date':
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
                <DataListContext.Provider
                    value={{
                        form: form
                    }}    
                >
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
                        >
                            {data.map((item, index) => { 
                                return(
                                    <ListItem
                                        key={'ListItem' + index}
                                        item={item}
                                        edited={editedFields.hasOwnProperty(item.field)}
                                        handleChange={(e) => {handleChange(e)}}
                                        form={form}
                                    />
                            )} 
                            )}    
                        </List>
                    </Form>
                </DataListContext.Provider>
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
    const {item, edited, form} = props
    
    const rules = (() => {
        if (edited && item.rules){
            return item.rules
        } else {
            return [{validator: async () => edited ? Promise.reject(new Error('Error')) : Promise.resolve()}]
        }
    })()

    const formItemProps = ({
        onChange: props.handleChange,
        name: item.field,
        rules: rules,
    }) 

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
            case 'date':
                return (
                    <DataPickerControlled 
                        form={form}
                        handleChange={props.handleChange}
                        isEdited={edited}
                    />
                )
            case 'customWORKING':
                return (
                    <>
                        {item.component(item, form, props.handleChange, edited)}
                        <Form.Item {...formItemProps} className="data-list-table-input__hidden">
                            <Input
                                style={{width: '100%', display: 'none'}}
                            />
                        </Form.Item>
                    </>
                )
            case 'custom':
                return (
                    item.component(item, props.handleChange, edited)
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
                    {...formItemProps}
                    children={valueField}
                />
            </div>                           
        </List.Item>
    )
}

const DataPickerControlled = ({value, onChange, handleChange, isEdited}) => {
    
    const onOk = (val) => {
        onChange(moment(val).toISOString())
        handleChange({
            target: {
                value: moment(val).toISOString(),
                id: 'date'
            }
        })
    }

    return (
        <DatePicker
            // style={{background: 'red'}}
            className={!isEdited ? "data-list-table-input" : null}
            showTime
            allowClear={false}
            inputReadOnly
            // value={showVal}
            value={moment(value)}
            // onChange={handleChange}
            onOk={onOk}
        />
    )
}
