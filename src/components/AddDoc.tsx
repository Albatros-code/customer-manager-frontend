import React, { CSSProperties } from 'react'
import {Button, Modal} from 'antd'

import DataList from './DataList'

import {useDatabaseTableContext} from './DatabaseTable';
import {getData} from '../util/data';
import {api} from '../util/util';

// types
import { IDataModel } from '../util/data'
import { IDataList } from './DataList'
import { IDatabaseDoc } from '../interfaces';

interface IAddDoc<D extends IDatabaseDoc> {
    label: string,
    forceUpdate: any,
    dataModel: IDataModel<D>,
    apiUrl: string,
    buttonStyle?: CSSProperties,
}

export default function AddDoc<D  extends IDatabaseDoc>(props: IAddDoc<D>){

    const {label, forceUpdate, buttonStyle, dataModel, apiUrl} = props

    const [modalVisible, setModalVisible] = React.useState(false)

    const handleClick = () => {
        setModalVisible(true)
    }

    const handleCancel = () => {
        setModalVisible(false)
    }

    const databaseTableContext = useDatabaseTableContext()
    const updateTableContent = databaseTableContext?.updateTableContent


    const [needUpdate, setNeedUpdate] = React.useState(false)

    React.useEffect(() => {
        return (() => {
            if (needUpdate && updateTableContent) {
                updateTableContent()
            }            
        })
    }, [needUpdate, updateTableContent])

    // React.useEffect(() => {
    //     setdocData(props.docData)    
    // },[props.docData])

    // const [docData, setdocData] = React.useState({})
    const listData = React.useMemo(() => getData(dataModel), [dataModel])

    const OnSave:IDataList<D>['onSave'] = (values, callbackRes, callbackErr) => {
        
        const formatedData = {...values}
        // formatedData.duration = parseInt(formatedData.duration)
        // formatedData.price = parseInt(formatedData.price)

        api.post(`${apiUrl}`, {
            ...formatedData
        })
        .then(() => {
            setNeedUpdate(true)
            if (callbackRes) callbackRes({resetFields: () => true})
            setModalVisible(false)
            forceUpdate()
            // updateTableContent()
        })
        .catch(err => {
            console.log(err.response)
            if (callbackErr && err.response.data.errors) callbackErr(err.response.data.errors)
        })
    }

    return (
        <>
            <Button onClick={handleClick} style={buttonStyle}>{label ? label : `Add new document`}</Button>
            {/* <Button onClick={forceUpdate}>rerender</Button> */}
            <Modal
                title={label ? label : `Add new document`}
                // destroyOnClose={true}
                className="database-interface-table--detail"
                centered
                visible={modalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <DataList 
                    data={listData}
                    label="Document's data"
                    onSave={OnSave}
                    buttonTags={{undo: 'Clear', save: 'Add document'}}
                />
            </Modal>
        </>
    )
}
