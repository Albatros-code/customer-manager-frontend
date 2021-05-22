import React from 'react';
import {Input, Modal, Spin} from 'antd';
import DatabaseTable from '../components/DatabaseTable';
import { api } from '../util/util';

export default function DataSelector(props) {
    const {showSelector, setShowSelector, onRowClick, queryField, dataUrl, displayData} = props

    // const searchInput = React.createRef(null)
    const searchField = React.useRef(null)

    React.useEffect(() => {
        if (showSelector) {
            setTimeout(() => searchField.current.select(), 400);
        }
    }, [showSelector])

    const columns = () => [
        {
            key: 'id',
            title: 'Name',
            dataIndex: ['id'],
            render: (text, record, index) => {
                return displayData(record)
            },
        },
    ]

    const [searchString, setSearchString] = React.useState(null)

    const handleSearch = (e) => {
        setSearchString(e.target.value)
    }

    const handleRowClick = (record, rowIndex) => {
        onRowClick(record.id)
        setSearchString(null)
    }

    return (
        <Modal 
        // className="database-interface-table--detail"
        destroyOnClose={true}
        mask={false}
        width={350}
        bodyStyle={{
            // maxHeight: '100hv',
            height: '730px'
            // overflowY: 'scroll'
        }}
        centered
        visible={showSelector}
        onCancel={() => {
            console.log('cancel')
            setSearchString(null)
            setShowSelector(false)
        }}
        footer={null}>
            <Input
                id="skip1"
                autoComplete="off"
                placeholder="Search" 
                style={{
                    margin: '0.2rem 0',
                    width: 'calc(100% - 80px)'
                }}
                value={searchString}
                onChange={handleSearch}
                ref={searchField}
            />

            <DatabaseTable 
                columns={columns}
                dataUrl={dataUrl}
                handleRowClick={handleRowClick}
                paginationHidden={true}
                filterQuery={searchString ? {
                    [`${queryField}__icontains`]: searchString,
                } : {}}
                orderQuery={`descend_${queryField}`}
            />
        </Modal>
    )
}

export const DataListDataSelector = ({record, handleChange, isEdited, dataUrl, displayData, queryField, value, onChange}) => {

    const [showValue, setShowValue] = React.useState(null)
    const [modalVisible, setModalVisible] = React.useState(false)

    function getValueToShow(docId, url, handleDisplay){
        
        return new Promise((resolve, reject) => {
            api.get(`${url}/${docId}`)
            .then((res) => {
                const display = handleDisplay(res.data.doc)
                return resolve(display)
            })
            .catch(err => reject(err))
        })
    }

    React.useEffect(() => {
        console.log('effect')
        getValueToShow(
            value,
            dataUrl,
            displayData
        )
            .then(res => {
                setShowValue(res)
            })
            .catch(err => {})
    }, [dataUrl, displayData, value])

    const handleOpen = () => {
        setModalVisible(true)
    }

    const handleRowClick = (id) => {
        if (id !== value) {
            onChange(id)
            handleChange({
                target: {
                    value: id,
                    id: record.field
                }
            })
            setShowValue(null)
        }
        setModalVisible(false)
    }
    
    return (
        <>
            <Spin spinning={!showValue}>
                <Input
                    style={{width: '100%'}}
                    className={!isEdited ? 'data-list-table-input' : null}
                    autoComplete="off"
                    id={record.field}
                    value={showValue}
                    readOnly={true}
                    onClick={handleOpen}
                />
            </Spin>
            <DataSelector 
                showSelector={modalVisible}
                setShowSelector={setModalVisible}
                onRowClick={handleRowClick}
                queryField={queryField}
                dataUrl={dataUrl}
                displayData={displayData}
            />
        </>
    )
}

