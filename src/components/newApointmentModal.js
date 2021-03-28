import React from 'react';
import {Modal, Spin} from 'antd';

const NewAppointmentModal = (props) => {

    const {
        visibilityState: [modalVisible, setModalVisible],
        title,
        contentInit,
        contentResolved,
        contentRejected,
        onConfirm,
        onResolve,
        onReject,
    } = props

    const [modalLoading, setModalLoading] = React.useState(false)
    const [modalResolved, setModalResolved] = React.useState(false)
    const [containerHeight, setContainerHeight] = React.useState(false)

    React.useEffect(() => {
        if (modalVisible){
            if (!containerHeight){
                setContainerHeight(document.getElementsByClassName("ant-modal-body")[0].clientHeight)
            } else {
                console.log('set height' + containerHeight)
                document.getElementsByClassName("ant-modal-body")[0].style.height = `${containerHeight}px`
            }
        }
    }, [containerHeight, setContainerHeight, modalVisible, modalResolved])

    const modalButtonProps = {
        ok: {disabled: modalLoading ? true: false},
        cancel: {
            disabled: modalLoading ? true: false,
            style: {display: modalResolved ? 'none' : 'inline-block'}}
    }
 
    const submitModalHandleOk = () => {
        if(!modalResolved){
            setModalLoading(true)
            onConfirm()
                .then(res => {
                    setModalLoading(false)
                    setModalResolved(contentResolved)
                }, err => {
                    setModalLoading(false)
                    setModalResolved(contentRejected)
                })
                .catch(err => {
                    setModalLoading(false)
                    setModalResolved(contentRejected)
                })
        } else if (modalResolved === contentResolved) {
            submitModalHandleCancel()
            onResolve()
        } else {
            submitModalHandleCancel()
            onReject()
        }
    };

    const submitModalHandleCancel = () => {
        setModalVisible(false);
        setModalResolved(false)
    };

    return(
        <Modal
            title={title}
            visible={modalVisible}
            onOk={submitModalHandleOk}
            onCancel={submitModalHandleCancel}
            okText={!modalResolved ? 'Confirm' : 'Ok'}
            okButtonProps={modalButtonProps.ok}
            cancelButtonProps={modalButtonProps.cancel}
        >
            <Spin spinning={modalLoading}>
                <div className="modal-container">
                    {!modalResolved ?
                        contentInit
                        :
                        modalResolved
                    }
                </div>
            </Spin>
        </Modal>
    ) 
}

export default NewAppointmentModal

