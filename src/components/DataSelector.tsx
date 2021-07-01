import React from 'react';
import {Input, Modal, Spin} from 'antd';
import DatabaseTable from './DatabaseTable';
import { api } from '../util/util';

// types
import { IDatabaseTable } from '../components/DatabaseTable'
import { IDatabaseDoc } from '../interfaces';

interface IDataSelector<R extends {id: string}> {
    showSelector: boolean,
    setShowSelector: React.Dispatch<React.SetStateAction<boolean>>,
    onRowClick: (recordId: string) => void,
    queryField: string,
    dataUrl: string,
    displayData: (doc: R) => string,
}

export default function DataSelector<R extends IDatabaseDoc>(props: IDataSelector<R>) {
    const {showSelector, setShowSelector, onRowClick, queryField, dataUrl, displayData} = props

    const searchField = React.useRef<Input>(null)

    React.useEffect(() => {
        if (showSelector) {
            setTimeout(() => searchField.current?.select(), 400);
        }
    }, [showSelector]) 

    const columns:IDatabaseTable<R>['columns'] = () => [
        {
            key: 'id',
            title: 'Name',
            dataIndex: ['id'],
            render: (text, record, index) => {
                return displayData(record)
            },
        },
    ]

    const [searchString, setSearchString] = React.useState('')

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchString(e.target.value)
    }

    const handleRowClick:IDatabaseTable<R>['handleRowClick'] = (record, rowIndex) => {
        onRowClick(record.id)
        setSearchString('')
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
            setSearchString('')
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

interface IDataListDataSelector<R extends {id: string}, D extends {id: string}> {
    record: R,
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    isEdited: boolean,
    dataUrl: string,
    displayData: (doc: D) => string,
    queryField: string,
    value?: any,
    onChange?: any,
}

export function DataListDataSelector<R extends {id: string, field: string}, D extends IDatabaseDoc>({record, handleChange, isEdited, dataUrl, displayData, queryField, value, onChange}:IDataListDataSelector<R, D>){

    const [showValue, setShowValue] = React.useState('')
    const [modalVisible, setModalVisible] = React.useState(false)

    
    React.useEffect(() => {
        function getValueToShow(docId: string, url: string, handleDisplay: (doc: D) => string){
            
            return new Promise<string>((resolve, reject) => {
                api.get<{doc: D, total: number}>(`${url}/${docId}`)
                .then((res) => {
                    // console.log('data fetched ' + docId)
                    const display = handleDisplay(res.data.doc)
                    return resolve(display)
                })
                .catch(() => reject(docId))
            })
        }

        getValueToShow(
            value,
            dataUrl,
            displayData
        )
            .then(res => {
                setShowValue(res)
            })
            .catch(err => {
                setShowValue(err)
            })
    }, [dataUrl, displayData, value])

    const handleOpen = () => {
        setModalVisible(true)
    }

    const handleRowClick = (id: string) => {
        if (id !== value) {
            onChange(id)
            handleChange({
                target: {
                    value: id,
                    id: record.field
                }
            } as React.ChangeEvent<HTMLInputElement>)
            setShowValue('')
        }
        setModalVisible(false)
    }
    
    return (
        <>
            <Spin spinning={!showValue}>
                <Input
                    style={{width: '100%'}}
                    className={!isEdited ? 'data-list-table-input' : ''}
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

