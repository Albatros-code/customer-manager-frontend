import React from 'react';
import {Modal, Spin} from 'antd';

type visibilityState = [boolean, React.Dispatch<React.SetStateAction<boolean>>]

interface IModalConfirmationProps {
    modalResolved: false | JSX.Element,
    
    visibilityState: visibilityState,
    title: string,
    contentInit: JSX.Element,
    contentRejected: JSX.Element,
    onConfirm: () => Promise<void>,
    onResolve: () => void,
    onReject: () => void,
    contentResolved: JSX.Element,
}

const defaultProps = {
    modalResolved: false,
    contentInit: "Modal content - Initial",
    contentRejected: "Modal content - Rejected",
    contentResolved: "Modal content - Resolved",
    onResolve: () => {},
    onConfirm: () => Promise.resolve(),
}

const ModalConfirmation = (props: IModalConfirmationProps) => {

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

    const containerRef = React.createRef<HTMLDivElement>()

    const [modalLoading, setModalLoading] = React.useState(false)
    const [containerHeight, setContainerHeight] = React.useState(0)

    const [modalResolved, setModalResolved] = React.useState<false | 'resolved' | 'rejected'>(false)

    React.useEffect(() => {
        if (modalVisible && containerRef.current){
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
                    setModalResolved('resolved')
                })
                .catch(err => {
                    setModalResolved('rejected')
                })
                .finally(() =>{
                    setModalLoading(false)
                })
        } else if (modalResolved === 'resolved') {
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
        if(modalResolved === 'resolved'){
            submitModalHandleOk()
        } else {
            setModalVisible(false)
            setModalResolved(false)
        }
    };

    const modalContentResolved = modalResolved === 'resolved' ? contentResolved : contentRejected
    const modalContent = !modalResolved ? contentInit : modalContentResolved

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
                    {modalContent}
                </div>
            </Spin>
        </Modal>
    ) 
}

ModalConfirmation.defaultProps = defaultProps

export default ModalConfirmation

