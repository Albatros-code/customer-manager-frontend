import React from 'react';
import {Button, Divider, Spin} from 'antd';

import DataList from './DataList';
import {useDatabaseTableContext} from './DatabaseTable';
import {serviceModel, getData} from '../util/data';
import {api} from '../util/util';
import ModalConfirmation from './ModalConfirmation';

// types
import { IServiceDoc } from '../interfaces/doc.interfaces';
import { OnSaveFunc } from './DataList';


interface IServiceDetails {
    doc: IServiceDoc,
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
}

const ServicesDetails = (props: IServiceDetails) => {
    const {doc, setVisible} = props

    return (
        <div>
            <ServiceData
                docId={doc.id}
                docData={doc}
                setVisible={setVisible}
            />
            <ServiceActions
                docData={doc}
                setVisible={setVisible}
            />
        </div>
    )
}

export default ServicesDetails

interface IServiceData {
    docId: string,
    docData: IServiceDoc,
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
}

const ServiceData = (props: IServiceData) => {
    const {docId} = props
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

    React.useEffect(() => {
        setdocData(props.docData)    
    },[props.docData])

    const [docData, setdocData] = React.useState(props.docData)
    const listData = React.useMemo(() => getData(serviceModel, docData, {
        email: {disabled: true}
    }), [docData])

    const OnSave: OnSaveFunc<IServiceDoc> = (values, callbackRes, callbackErr) => {
        
        api.put(`/services-admin/${docId}`, {
            service: values
        })
        .then(() => {
            setdocData(values)
            setNeedUpdate(true)
            if (callbackRes) callbackRes()
        })
        .catch(err => {
            console.log(err)
            if (callbackErr && err.response.data.errors) callbackErr(err.response.data.errors)
        })
    }
        return (
        
        <DataList 
            data={listData}
            label="Service's data"
            onSave={OnSave}
        />
    )
}

interface IServiceActions {
    docData: IServiceDoc,
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
}

const ServiceActions = (props: IServiceActions) => {
    const {docData: doc, setVisible} = props
    const databaseTableContext = useDatabaseTableContext()
    const updateTableContent = databaseTableContext?.updateTableContent
    
    const [loading] = React.useState(false)
    

    const [submitModalVisible, setSubmitModalVisible] = React.useState(false);

    const submitModal = !submitModalVisible ? null :
        <ModalConfirmation 
            visibilityState={[submitModalVisible, setSubmitModalVisible]}
            title={"Deleting service"}
            contentInit={<span>"Are you sure?"</span>}
            contentResolved={<span>"Service deleted successfully."</span>}
            contentRejected={<p>Something went wrong<br/>Service not deleted.</p>}
            onConfirm={() => {
                return new Promise((resolve, reject) => {
                    api.delete(`/services-admin/${doc.id}`)  
                        .then(res => {
                            return resolve()
                        }, err => {
                            return reject(err)
                        })
                        .catch(err => {
                            return reject(err)
                        })
                    })
                }}
            onResolve={
                // () => {setVisible(false)}
                () => {
                    updateTableContent && updateTableContent()
                    setVisible(false)
                }
            }
            onReject={
                () => {
                    // console.log('Rejected')
                }
            }
        />
    

    const btnStyle = {
        width: '80%',
        margin: '0.5rem',
    }
    return (
        <>
            <Divider orientation="left">Service's actions</Divider>
                <Spin spinning={loading}>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                    }}>
                    <Button
                        style={btnStyle}
                        onClick={() => {
                            setSubmitModalVisible(true)
                            // api.delete(`/Services/${doc.id}`)  
                            //     .then(res => {
                            //         setVisible(false)
                            //         updateTableContent()
                            //     })  
                        }}
                    >
                        {loading ? ' ' :
                            `Delete service`
                        }
                    </Button>
                </div>
                </Spin>
                {submitModal}
        </>
    )
}