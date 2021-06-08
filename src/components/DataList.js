import React from 'react';
import {List, Divider, Input, Form, Button, Checkbox, Spin} from 'antd';
import {DatePicker} from 'antd';
// import DatePicker from '../components/antd-dayjs/DatePicker'


import { useStore } from 'react-redux';
import {resolveRules, mergeErrors} from '../util/data';
import moment from 'moment';
// import {dayjsExtended as dayjs} from '../util/util'

export const DataListContext = React.createContext([]);

export const useDataListContext = () => React.useContext(DataListContext);

const DataList = (props) => {
    const [form] = Form.useForm();

    // const {buttonTags: {undo: btnUndoTag = 'elo', save: btnSaveTag}} = props
    const {buttonTags: {undo: btnUndoTag = "Undo", save: btnSaveTag = "Save"} = {}} = props

    // React.useEffect(() => {
    //     return () => console.log('unmounting DataList')
    // }, [])


    const [errors, setErrors] = React.useState({})
    const [formLoading, setFormLoading] = React.useState(false)
    const [editedFields, setEditedFields] = React.useState({})
    const data = React.useMemo(() => 
        resolveRules(props.data, {errors: errors})
    ,[errors, props.data])

    const initialValues = React.useMemo(() => Object.fromEntries(data.map(item => {
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
    })), [data])

    const handleChange = React.useCallback((e) => {
        if (e.target.id.includes('skip')) return
        const label = e.target.id
        const value = e.target.value
        
        if (initialValues[label] === value || String(initialValues[label]) === String(value)){
            setEditedFields(prev => {
                const copy = {...prev}
                delete copy[label]
                return copy
            })
        } else {
            setEditedFields(prev => ({...prev, [label]: value}))
        }
    },[initialValues])

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
                const callbackRes = (props = {}) => {
                    const {resetFields} = props
                    setEditedFields({})
                    if (resetFields) form.resetFields()
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
                setFormLoading(false)
            })
    }

    return(
        <div className="data-list-section">
            <Divider orientation="left">{props.label}</Divider>
            <div className="data-list-form">
            {/* <button onClick={() => form.validateFields().then(values => {console.log('resolved'); console.log(values)}, err => {console.log('error'); console.log(err.values)} )}>validate form</button> */}
            <Spin spinning={formLoading}>
                {/* <DataListContext.Provider
                    value={{
                        form: form
                    }}    
                > */}
                    <Form
                        form={form}
                        // validateTrigger="onChange"
                        validateTrigger="onSubmit"
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
                                        key={'ListItem' + item.field + index}
                                        item={item}
                                        edited={editedFields.hasOwnProperty(item.field)}
                                        // handleChange={(e) => {handleChange(e)}}
                                        handleChange={handleChange}
                                    />
                                )
                            })}    
                        </List>
                    </Form>
                {/* </DataListContext.Provider> */}
                <div className="data-list-table-footer">

                    <Button 
                        onClick={() => {
                            const touchedFields = Object.keys(form.getFieldsValue()).filter(item => form.isFieldsTouched([item]))
                            const withErrorFields = form.getFieldsError().filter(item => item.errors.length > 0).map(item => item.name.join())
                            const toResetFields = [...touchedFields, ...withErrorFields.filter((item) => touchedFields.indexOf(item) < 0)]
                            // form.resetFields(Object.keys(editedFields))
                            form.resetFields(toResetFields)
                            setEditedFields({})
                        }}
                        disabled={Object.keys(editedFields).length === 0 ? true : false}
                    >{btnUndoTag}</Button>
                    <Button 
                        onClick={handleClick}
                        type="primary"
                        disabled={Object.keys(editedFields).length === 0 ? true : false}
                    >{btnSaveTag}</Button>
                </div>
            </Spin>
            </div>
        </div>
    )
}

export default DataList

const ListItem = (props) => {
    const {item, edited} = props

    // const rules = (() => {
    //     if (edited && item.rules){
    //         return item.rules
    //     } else {
    //         return [{validator: async () => edited ? Promise.reject(new Error('Error')) : Promise.resolve()}]
    //     }
    // })()

    const rules = item.rules

    const formItemProps = ({
        onChange: props.handleChange,
        name: item.field,
        rules: rules,
    })

    // field input options
    
    // const inputField = 
    //     <Input
    //         className={!edited ? 'data-list-table-input' : null}
    //         autoComplete="off"
    //         style={{width: '100%'}}
    //         disabled={item.disabled}
    //     />
    
    // const dateField =
    //     <DataPickerControlled
    //         handleChange={props.handleChange}
    //         isEdited={edited}
    //     />
    
    // const customField = item.component ? item.component(item, props.handleChange, edited) : null;

    // const customField = React.useMemo(() => {
    //     if (item.component){
    //         return (
    //             item.component(item, props.handleChange, edited)
    //         )
    //     }
    // },[item, props.handleChange, edited])
    
    // const valueFieldObj = {
    //     input: inputField,
    //     custom: customField,
    //     date: dateField
    // }

    const valueField = React.useMemo(() => {
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
                        handleChange={props.handleChange}
                        isEdited={edited}
                    />
                )
            // case 'customWORKING':
            //     return (
            //         <>
            //             {item.component(item, form, props.handleChange, edited)}
            //             <Form.Item {...formItemProps} className="data-list-table-input__hidden">
            //                 <Input
            //                     style={{width: '100%', display: 'none'}}
            //                 />
            //             </Form.Item>
            //         </>  
            //     )
            case 'custom':
                return (
                    item.component(item, props.handleChange, edited)
                )
            default:
                return (
                    <div>no item specified</div>
                )
        }
    },[edited, item, props.handleChange])    

    // const [valueFieldState, setValueFieldState] = React.useState(valueField)

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
    const {data: {settings: {start_hour, end_hour, time_interval}}} = useStore().getState()

    const onOk = (val) => {
        onChange(moment(val).toISOString())
        handleChange({
            target: {
                value: moment(val).toISOString(),
                id: 'date'
            }
        })
    }

    function range(start, end) {
        const result = [];
        for (let i = start; i < end; i++) {
            result.push(i);
        }
        return result;
      }

    function disabledDateTime() {
        
        return {
          disabledHours: () => range(0, 24).filter(item => item < start_hour || item >= end_hour),
        //   disabledMinutes: () => range(30, 60),
        };
      }

    return (
        <DatePicker
            style={{width: '100%'}}
            className={!isEdited ? "data-list-table-input" : null}
            showTime={{
                format: 'HH:mm',
                minuteStep: time_interval,
            }}
            hideDisabledOptions={true}
            disabledTime={disabledDateTime}
            format="YYYY-MM-DD HH:mm"
            allowClear={false}
            inputReadOnly
            value={moment(value)}
            onOk={onOk}
        />
    )
}
