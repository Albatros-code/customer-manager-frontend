import React from 'react';
import {Button, Divider, Spin} from 'antd';

import DataList from './DataList';
import {useDatabaseTableContext} from './DatabaseTable';
import {serviceModel, getData} from '../util/data';
import {api} from '../util/util';
import ModalConfirmation from '../components/ModalConfirmation';


const ServicesDetails = (props) => {
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



const ServiceData = (props) => {
    const {docId} = props
    const {updateTableContent} = useDatabaseTableContext()

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

    const OnSave = (values, callbackRes, callbackErr) => {
        
        const formatedData = {...values}
        formatedData.duration = parseInt(formatedData.duration)

        api.put(`/services-admin/${docId}`, {
            service: formatedData
        })
        .then(() => {
            setdocData(formatedData)
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

const ServiceActions = (props) => {
    const {docData: doc, setVisible} = props
    const {updateTableContent} = useDatabaseTableContext()
    
    const [loading] = React.useState(false)
    

    const [submitModalVisible, setSubmitModalVisible] = React.useState(false);

    const submitModal = !submitModalVisible ? null :
        <ModalConfirmation 
            visibilityState={[submitModalVisible, setSubmitModalVisible]}
            title={"Deleting service"}
            contentInit={"Are you sure?"}
            contentResolved={"Service deleted successfully."}
            contentRejected={<p>Something went wrong<br/>Service not deleted.</p>}
            onConfirm={() => {
                return new Promise((resolve, reject) => {
                    api.delete(`/services-admin/${doc.id}`)  
                        .then(res => {
                            return resolve(res)
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
                    updateTableContent()
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