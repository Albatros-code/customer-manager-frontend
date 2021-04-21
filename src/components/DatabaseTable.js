import React from "react";
import {Table} from "antd";
import {Input, Space, Button, Select, Modal} from "antd";
import { SearchOutlined } from '@ant-design/icons';

import {api} from "../util/util"

export const DatabaseTableContext = React.createContext([]);

export const useDatabaseTableContext = () => React.useContext(DatabaseTableContext);

const DatabaseTable = (props) => {
    const {dataUrl, itemDetails, defaultItemSelected} = props
    const columns = props.columns(getColumnSearchProps)

    const [data, setData] = React.useState({data: [], total: null})
    const [loading, setLoading] = React.useState(true)
    const [pagination, setPagination] = React.useState({current: 1, pageSize: 10})
    const [filter, setFilter] = React.useState(null)
    const [order, setOrder] = React.useState(null)

    const [detailsVisible, setDetailsVisible] = React.useState(false)

    
    const getData = React.useCallback(
        (filterVal = filter) => {
            setLoading(true)
            api.get(dataUrl, {
                params: {
                    pagination: pagination.pageSize,
                    page: pagination.current,
                    order: order,
                    filter: filterVal,
                }})
                .then(res => {
                    setData({data: res.data.data, total: res.data.total})
                    setLoading(false)
                    if (defaultItemSelected){
                        setDetailsVisible(0)
                    }
                }, err => {
                }) 
            }, [dataUrl, defaultItemSelected, filter, order, pagination]);
            
    // React.useEffect(() => {
    //     if (defaultItemSelected && data.data.length > 1){
    //         getData({id: defaultItemSelected})
    //         setDetailsVisible(0)
    //     }
    // },[data, defaultItemSelected, getData])
            
    React.useEffect(() => {
        // if (!Number.isInteger(detailsVisible)){
            console.log('effect')
            const filterQuery = defaultItemSelected ? {id: defaultItemSelected} : undefined
            getData(filterQuery)        
        // }
    },[defaultItemSelected, getData])  

    
    const handleSearch = (selectedKeys, confirm, dataIndex, filters) => {
        setFilter(prev => ({...prev, ...filterQuery(dataIndex, selectedKeys)}))
        confirm();
    };
    
    const handleReset = clearFilters => {
        clearFilters();
        setFilter({})
    };

    const handleTableChange = (pagination, filters, sorter, extra) => {
        setPagination({...pagination})
        setOrder(orderQuery(sorter))
        setLoading(true)
    }
    
    function orderQuery(sorter){
        let queryString = ''
        if (sorter.order !== undefined){
            queryString = sorter.order + '_'
        } else {
            return queryString
        }

        sorter.field.forEach((item, index) => {
            queryString = queryString + item
            if(sorter.field.length !== index + 1){
                queryString = queryString + '__'
            }
        })

        return queryString
    }
    
    function filterQuery(dataIndex, selectedKeys){
        return (
            {[dataIndex.toString().replace(',', '__') + '__icontains']: selectedKeys[0]}
        )
    }

    function getColumnSearchProps(dataIndex){
        let searchField = null
        return({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, filters }) => {
            return(
            <div style={{ padding: 8 }}>
                <Input
                    ref={node => {
                        searchField = node;
                    }}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => {setSelectedKeys(e.target.value ? [e.target.value] : [])}}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex, filters)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                        Reset
                    </Button>
                </Space>
            </div>
        )},
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => searchField.select(), 100);
            }
        },
    })};

    return (
        <div className="database-interface-table-wrapper">
            <Table
                className="database-interface-table"
                columns={columns}
                rowKey={record => record.id}
                pagination={{
                    ...pagination,
                    size: "default",
                    total: data.total,
                    showSizeChanger: true,
                    simple: true
                }}
                rowClassName={() => itemDetails ? 'row__clickable' : ''}
                dataSource={data.data}
                loading={loading}
                onChange={handleTableChange}
                scroll={{x: true}}
                onRow={(record, rowIndex) => {
                    return {
                        onClick: () => {setDetailsVisible(rowIndex)},
                    };
                }}
            />
            <div className={`pagination ${data.data.length === 0 ? 'pagination__hidden' : ''}`}>
                <span className="pagination--text">show:</span>
                <Select 
                    className="pagination--select"
                    size="small"
                    onChange={(val) => {
                        setLoading(true)
                        
                        setPagination(prev => ({...prev, pageSize: val}))
                        // remove additional rows
                        if (data.data.length - val > 0) {
                            setData(({data, ...rest}) => ({...rest, data: data.slice(0, val-1)}))
                        }
                    }}
                    defaultValue={pagination.pageSize}
                >
                    {[10, 20, 50, 100].map(item => (
                        <Select.Option key={item} value={item}>{item}</Select.Option>
                    ))}
                </Select>
            </div>
            {itemDetails ?
                <DatabaseTableContext.Provider value={{
                    updateTableContent: getData
                }}>
                    <ItemDetails 
                        visible={detailsVisible}
                        setVisible={setDetailsVisible}
                        record={data.data[detailsVisible]}
                        details={itemDetails}
                    />
                </DatabaseTableContext.Provider>
                : null
            }
        </div>
    )
}

export default DatabaseTable

export const ItemDetails = (props) => {

    const {visible, setVisible, details, record} = props

    return (
        Number.isInteger(visible) ? 
            <Modal
                className="database-interface-table--detail"
                centered
                visible={Number.isInteger(visible)}
                onCancel={() => {setVisible(prev=>!prev)}}
                footer={null}
            >
                {details(record, setVisible)}
          </Modal>
        : null
        
    )
}