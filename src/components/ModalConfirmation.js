import React from 'react';
import {Modal, Spin} from 'antd';

const ModalConfirmation = (props) => {

    const {
        visibilityState: [modalVisible, setModalVisible],
        title,
        contentInit,
        // contentResolved,
        contentRejected,
        onConfirm,
        onResolve,
        onReject,
    } = props

    const containerRef = React.createRef()

    const [modalLoading, setModalLoading] = React.useState(false)
    const [modalResolvedUseState, setModalResolved] = React.useState(false)
    const [containerHeight, setContainerHeight] = React.useState(false)

    const modalResolved = props.modalResolved ? props.modalResolved : modalResolvedUseState
    const contentResolved = props.modalResolved ? props.modalResolved : props.contentResolved

    React.useEffect(() => {
        if (modalVisible){
            if (!containerHeight){
                setContainerHeight(containerRef.current.clientHeight)
            } else {
                containerRef.current.style.height = `${containerHeight}px`
            }
        }
    }, [containerRef, containerHeight, setContainerHeight, modalVisible, modalResolved])

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
                    setModalResolved(contentResolved)
                }, err => {
                    setModalResolved(contentRejected)
                })
                .catch(err => {
                    setModalResolved(contentRejected)
                })
                .finally(() =>{
                    setModalLoading(false)
                })
        } else if (modalResolved === contentResolved) {
            setModalVisible(false)
            setModalResolved(false)
            onResolve()
        } else {
            setModalVisible(false)
            setModalResolved(false)
            onReject()
        }
    };

    const submitModalHandleCancel = () => {
        if(modalResolved === contentResolved){
            submitModalHandleOk()
        } else {
            setModalVisible(false)
            setModalResolved(false)
        }
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
                <div className="modal-container" ref={containerRef}>
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

export default ModalConfirmation

