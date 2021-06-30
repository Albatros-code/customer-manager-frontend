import React from 'react';
import {List, Divider, Input, Form, Button, Checkbox, Spin} from 'antd';
import {DatePicker} from 'antd';


import { useStore } from 'react-redux';
import {resolveRules, mergeErrors} from '../util/data';
// TODO: change moment to dayjs in ant design
import moment from 'moment';

// types
import { IData, IDataItem, IFieldErrors } from '../util/data';
import { IDatabaseDoc } from '../interfaces'

export const DataListContext = React.createContext([]);

export const useDataListContext = () => React.useContext(DataListContext);

export type OnSaveFunc<D extends IDatabaseDoc> = (
    values: D,
    callbackRes: (properties?: {resetFields: (() => void)}) => void,
    callbackErr: (errors: IFieldErrors) => void
) => void

export interface IDataList<D extends IDatabaseDoc> {
    data: IData<D>,
    onSave: OnSaveFunc<D>,
    label: string,
    buttonTags?: {
        undo: string,
        save: string,
    },
}

const defaultProps = {
    buttonTags: {
        undo: "Undo",
        save: "Save",
    },
}

export default function DataList<D extends IDatabaseDoc>(props:IDataList<D>) {
    const [form] = Form.useForm();

    const {buttonTags: {undo: btnUndoTag = "Undo", save: btnSaveTag = "Save"} = {}} = props

    const [errors, setErrors] = React.useState<IFieldErrors>({})
    const [formLoading, setFormLoading] = React.useState(false)
    const [editedFields, setEditedFields] = React.useState<{[key: string]: string}>({})
    const data = React.useMemo(() => 
        resolveRules<D, IDataItem<D>>(props.data, {errors: errors})
    ,[errors, props.data])

// TODO: Extract to separate function for each type

    const initialValues = React.useMemo(() => Object.fromEntries(data.map(item => {
        let value = null
        switch (item.type){
            case 'custom':
                value = item.value
                break
            case 'input':
                value = item.value
                break
            case 'input-number':
                value = item.value
                break
            case 'date':
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

    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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

// TODO: Extract to separate function for each type

    function formatResults(dataModel: IData<D>, values: {[key: string]: any}):D{
        const results = Object.fromEntries(dataModel.map((item) => {
            let value: any
            switch (item.type){
                case 'input':
                case 'custom':
                case 'date':
                    value = values[item.field]
                    break
                case 'item-number':
                    value = parseInt(values[item.field])
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

        return results as D
    }

    const handleClick = () => {
        setFormLoading(true)
        form.validateFields()
            .then(values => {
                const formatedValues = formatResults(data, values)
                const callbackRes = (properties: {resetFields?: () => void} = {}) => {
                    const {resetFields} = properties
                    setEditedFields({})
                    if (resetFields) form.resetFields()
                    setFormLoading(false)
                }
                const callbackErr = (err: IFieldErrors) => {
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
            <Spin spinning={formLoading}>
                <Form
                    form={form}
                    validateTrigger="onChange"
                    // validateTrigger="onSubmit"
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
                                    handleChange={handleChange}
                                />
                            )
                        })}    
                    </List>
                </Form>
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

DataList.defaultProps = defaultProps

interface IListItem<D> {
    item: IDataItem<D>,
    edited: boolean,
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    
}

function ListItem<D = any>(props: IListItem<D>){
    const {item, edited} = props

    const rules = item.rules

    const formItemProps = ({
        onChange: props.handleChange,
        name: item.field,
        rules: rules,
        // normalize: (value: string) => item.type === "item-number" && value !== "" && !isNaN(Number(value)) ? Number(value) : value
    })

// TODO: Extract to separate function for each type

    const valueField = React.useMemo(() => {
        switch (item.type){
            case 'input':
            case 'input-number': 
                return (
                    <Input
                        className={!edited ? 'data-list-table-input' : ''}
                        autoComplete="off"
                        style={{width: '100%'}}
                        disabled={item.disabled}
                    />
                )
            case 'checkbox-list':
                const itemOptions = item.options ? item.options : []
                const options = Object.keys(item.value).map((key, index) => {
                    return ({
                        label: itemOptions[index],
                        value: key,
                    })
                })
                
                return (
                    <Checkbox.Group className="checkbox-list__wrapper">
                    {options.map((option, index) => 
                        <Checkbox 
                            key={option.label+index}
                            value={option.value}
                            >
                            {option.label}
                        </Checkbox>
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
            case 'custom':
                const component = item.component ? item.component : () => null
                // TODO: solve any issue
                return (
                    component(item as any, props.handleChange, edited)
                )
            default:
                return (
                    <div>no item specified</div>
                )
        }
    },[edited, item, props.handleChange])    

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

interface IDataPickerControlledParams {
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    isEdited: boolean,
    value?: string,
    onChange?: (value: string) => void,
}

const DataPickerControlled = ({value, onChange, handleChange, isEdited}:IDataPickerControlledParams) => {
    const {data: {settings: {start_hour, end_hour, time_interval}}} = useStore().getState()

    function onOk(val: moment.Moment) {
        if (onChange) {
            onChange(moment(val).toISOString())
            const newChangeObj = {
                target: {
                    value: moment(val).toISOString(),
                    id: 'date'
                }
            }
            handleChange(newChangeObj as React.ChangeEvent<HTMLInputElement>)
        }
    }

    function range(start: number, end: number) {
        const result = [];
        for (let i = start; i < end; i++) {
            result.push(i);
        }
        return result;
      }

    function disabledDateTime() {
        
        return {
            disabledHours: () => range(0, 24).filter(item => item < start_hour || item >= end_hour),
        };
      }

    return (
        <DatePicker
            style={{width: '100%'}}
            className={!isEdited ? "data-list-table-input" : ""}
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
