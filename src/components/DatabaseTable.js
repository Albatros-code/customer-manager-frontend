import React from "react";
import {Table} from "antd";
import {Input, Space, Button, Select, Modal, DatePicker} from "antd";
import {SearchOutlined} from '@ant-design/icons';
import queryString from 'query-string'
import {useHistory, useLocation} from 'react-router-dom';

import {api} from "../util/util"
import {dayjsExtended as dayjs} from '../util/util'
import moment from "moment";

var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

export const DatabaseTableContext = React.createContext([]);

export const useDatabaseTableContext = () => React.useContext(DatabaseTableContext);

const DatabaseTable = (props) => {
    const history = useHistory()
    const {dataUrl, itemDetails, useQueryParams} = props
    
    const location = useLocation()
    const queryParams = queryString.parse(location.search)
    const {
        pagination: paginationQuery = 10,
        page: pageQuery = 1,
        order: orderQuery = null,
        filter: filterQuery = null,
        showRow: showRowQuery = false
    } = queryParams

    const [paginationState, setPagination] = React.useState(10)
    const [pageState, setPage] = React.useState(1)
    const [orderState, setOrder] = React.useState(null)
    const [filterState, setFilter] = React.useState(null)

    const pagination = useQueryParams ? paginationQuery : paginationState
    const page = useQueryParams ? pageQuery : pageState
    const order = useQueryParams ? orderQuery : orderState
    const filter = useQueryParams ? filterQuery : filterState
    
    const [loading, setLoading] = React.useState(true)
    const [data, setData] = React.useState({data: [], total: null})
    const [sortedInfo, setSortedInfo] = React.useState({})
    const [filteredInfo, setFilteredInfo] = React.useState({})
    const [detailsVisible, setDetailsVisible] = React.useState(false)


    const getData = React.useCallback(() => {
        console.log('data update')
        setLoading(true)
        setDetailsVisible(false)

        api.get(dataUrl, {
            params: {
                pagination: pagination,
                page: page,
                order: order,
                filter: filter,
            }})
            .then(res => {
                setData({data: res.data.data, total: res.data.total})
                setLoading(false)
                setFilteredInfo(filter ? filterToFilteredInfo(filter) : {})
                setSortedInfo(order ? orderToOrderInfo(order) : {})
            }, err => {
                setData({data: 0, total: 0})
                setLoading(false)
        }) 
    }, [dataUrl, filter, order, page, pagination]);
    
    React.useEffect(() => {
        getData()
    },[getData])

    React.useEffect(() => {
        if (useQueryParams){
            setDetailsVisible(parseInt(showRowQuery))
        }
    },[showRowQuery, useQueryParams])

    // function clearQuery(){
    //     setFilteredInfo({});
    //     setSortedInfo({});
    //     history.push({
    //         search: ''
    //     })
    // };
    
    function filterToFilteredInfo(filter){
        // console.log(filter)
        const filterObj = JSON.parse(filter)
        const newObj = Object.fromEntries(Object.entries(filterObj).map(([key, val]) => {
            
            if (key.includes('__gt') || key.includes('__lt')){
                return [key, val]
            }

            const newKey = key.toString().substring(0, key.lastIndexOf('__')).replace("__", ",")
            const newVal = [val]
            return [newKey, newVal]
        }))
                
        let composedFilters = {}
        for (const [key, value] of Object.entries(newObj)) {
            if (key.includes('__gt') || key.includes('__lt')){
                delete newObj[key]
                composedFilters['date'] = {...composedFilters['date'], [key]: value}
            }
        }

        for (const [key, value] of Object.entries(composedFilters)) {
            composedFilters[key] = [JSON.stringify(value)]
        }

        return {...newObj, ...composedFilters}
    }

    function orderToOrderInfo(order){
        const orderVal = order.toString().replace('__', '-').split("_")[0]
        const fieldVal = order.toString().replace('__', '-').split("_")[1].split("-")
        const sorterObj = {
            order: orderVal,
            field: fieldVal,
        }
        console.log(sorterObj)
        return sorterObj
    }

    function getOrderQuery(sorter){
        let queryString = null
        if (sorter.order && sorter.order !== undefined){
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
    
    function getFilterQuery(dataIndex, selectedKeys){
        return (
            {[dataIndex.toString().replace(',', '__') + '__icontains']: selectedKeys[0]}
        )
    }

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        if (selectedKeys.length !== 0){
             if (useQueryParams){
                history.push({
                    search: queryString.stringify({
                        ...queryParams,
                        page: 1,
                        filter: JSON.stringify({...JSON.parse(filter), ...getFilterQuery(dataIndex, selectedKeys)})
                    })
                })
            } else {
                setPage(1)
                setFilter(JSON.stringify({...JSON.parse(filter), ...getFilterQuery(dataIndex, selectedKeys)}))
            }
            confirm();
        } 
    };
    
    const handleReset = (selectedKeys, dataIndex, type) => {
        if (selectedKeys.length !== 0){
            const removeSingleFilter = () => {
                if (filter) {
                    if (type !== 'date'){
                        const {[Object.keys(getFilterQuery(dataIndex, selectedKeys))[0]]: remove, ...rest} = {...JSON.parse(filter)}
                        return Object.keys(rest).length !== 0 ? {filter: JSON.stringify(rest)} : null
                    } else {
                        console.log(selectedKeys)
                        console.log(dataIndex)
                        let newFilter = {...JSON.parse(filter)}
                        for (const [key, value] of Object.entries(JSON.parse(selectedKeys[0]))) {
                            delete newFilter[key]
                        }
                        return Object.keys(newFilter).length !== 0 ? {filter: JSON.stringify(newFilter)} : null
                    }
                } else {
                    return null
                }
            }
            const {filter: excluded, ...restQueryParams} = queryParams
            
            if (useQueryParams){
                history.push({
                    search: queryString.stringify({
                        ...restQueryParams,
                        page: 1,
                        ...(removeSingleFilter())
                    })
                })
            } else {
                setPage(1)
                const newFilter = removeSingleFilter()
                if (newFilter){
                    setFilter(newFilter.filter)
                } else {
                    setFilter()
                }
            }
        }
    };

    const handleTableChange = (pagination, filters, sorter, extra) => {
        if (extra.action === 'filter') return

        const {order: excluded, ...restQueryParams} = queryParams
        const order = getOrderQuery(sorter) ? {order: getOrderQuery(sorter)} : (useQueryParams ? {} : null)
        console.log(sorter)
        if (useQueryParams){
            history.push({
                search: queryString.stringify({
                    ...restQueryParams,
                    page: pagination.current,
                    pagination: pagination.pageSize,
                    ...order,
                })
            })
        } else {
            setPage(pagination.current)
            setPagination(pagination.pageSize)
            if (order) {
                setOrder(order.order)
            } else {
                setOrder(null)
            }
        }
    }

    function resetUrl(){
        const {showRow: excluded, ...restQueryParams} = queryParams
        if (useQueryParams){
            history.push({
                search: queryString.stringify({
                    ...restQueryParams,
                })
            })
        } else {
            setDetailsVisible(false)
        }
    }

    function setUrl(rowIndex){
        if (useQueryParams){
            history.push({
                search: queryString.stringify({
                    ...queryParams,
                    showRow: rowIndex
                })
            })
        } else {
            setDetailsVisible(rowIndex)
        }
        
    }

    const handleDateSelect = (setSelectedKeys, dataIndex, type, dateString, selectedKeys) => {//(momentObj, dateString) => {
        console.log('date change')
        console.log(dateString)
        let prev = selectedKeys[0] ? JSON.parse(selectedKeys[0]) : {}
        if (dateString !== '') {
            setSelectedKeys([JSON.stringify({...prev, [dataIndex.join() + '__' + type]: dateString})])
        } else {
            delete prev[dataIndex.join() + '__' + type]
            setSelectedKeys(Object.keys(prev).length > 0 ? [JSON.stringify(prev)] : [])
        }

    }

    const handleDateSearch = (selectedKeys, confirm, dataIndex) => {
        const selectedKeysObj = selectedKeys[0] ? JSON.parse(selectedKeys[0]) : {}
        const startDateString = selectedKeysObj.hasOwnProperty(dataIndex.join() + '__gt') ? selectedKeysObj[dataIndex.join() + '__gt'] : null
        const endDateString = selectedKeysObj.hasOwnProperty(dataIndex.join() + '__lt') ? selectedKeysObj[dataIndex.join() + '__lt'] : null
        
        if (startDateString || endDateString){   
            if (useQueryParams){
                history.push({
                    search: queryString.stringify({
                        ...queryParams,
                        page: 1,
                        filter: JSON.stringify({...JSON.parse(filter), ...JSON.parse(selectedKeys[0])})
                    })
                })
            } else {
                setPage(1)
                setFilter(JSON.stringify({...JSON.parse(filter),  ...JSON.parse(selectedKeys[0])}))
            }
            confirm();
        }
    }

    const getColumnSearchProps = (dataIndex, type) => {
        let searchField = null
        
        switch (type) {
            case 'date':
                return ({
                    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, filters }) => {
                        const selectedKeysObj = selectedKeys[0] ? JSON.parse(selectedKeys[0]) : {}
                        const startDateString = selectedKeysObj.hasOwnProperty(dataIndex.join() + '__gt') ? selectedKeysObj[dataIndex.join() + '__gt'] : null
                        const endDateString = selectedKeysObj.hasOwnProperty(dataIndex.join() + '__lt') ? selectedKeysObj[dataIndex.join() + '__lt'] : null
        
                        return(
                            <Space style={{ padding: 8 }} direction='vertical'>
                                <DatePicker
                                    allowClear={false}
                                    onChange={(momentObj, dateString) => handleDateSelect(setSelectedKeys, dataIndex, 'gt', dateString, selectedKeys)}
                                    style={{width: '100%'}}
                                    placeholder='Start Date'
                                    value={startDateString ? moment(startDateString, 'YYYY-MM-DD') : null}
                                />
                                <DatePicker
                                    allowClear={false}
                                    onChange={(momentObj, dateString) => handleDateSelect(setSelectedKeys, dataIndex, 'lt', dateString, selectedKeys)}
                                    style={{width: '100%'}}
                                    placeholder='End Date'
                                    value={endDateString ? moment(endDateString, 'YYYY-MM-DD') : null}
                                />
                                <Space>
                                    <Button
                                        type="primary"
                                        onClick={() => handleDateSearch(selectedKeys, confirm, dataIndex)}
                                        icon={<SearchOutlined />}
                                        size="small"
                                        style={{ width: 90 }}
                                        disabled={!(startDateString || endDateString)}
                                    >
                                        Search
                                    </Button>
                                    <Button 
                                        onClick={() => handleReset(selectedKeys, dataIndex, type)}
                                        size="small"
                                        // disabled={!(startDateString || endDateString)}
                                        style={{ width: 90 }}
                                    >
                                        Reset
                                    </Button>
                                </Space>
                            </Space>
                    )},
                    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
                    filteredValue: filteredInfo[dataIndex],
                    sortOrder: sortedInfo.hasOwnProperty('field') && sortedInfo.field.join() === dataIndex.join() && sortedInfo.order
                    
                })
            default:
                return ({
                    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, filters }) => {
                        return(
                            <div style={{ padding: 8 }}>
                                <Input
                                    ref={node => {
                                        searchField = node;
                                    }}
                                    placeholder={`Search ${dataIndex}`}
                                    value={selectedKeys[0]}
                                    onChange={e => {
                                        setSelectedKeys(e.target.value ? [e.target.value] : [])
                                    }}
                                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
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
                                    <Button onClick={() => handleReset(selectedKeys, dataIndex)} size="small" style={{ width: 90 }}>
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
                    filteredValue: filteredInfo[dataIndex],
                    sortOrder: sortedInfo.hasOwnProperty('field') && sortedInfo.field.join() === dataIndex.join() && sortedInfo.order
                })

            
        }
    }

    const columns = props.columns(getColumnSearchProps).map(item => {
        if (item.hasOwnProperty('sorter') && item.sorter && !item.hasOwnProperty('sortOrder')){
            return {
                ...item,
                sortOrder: sortedInfo.hasOwnProperty('field') && sortedInfo.field.join() === item.dataIndex.join() && sortedInfo.order
            }
        } else {
            return item
        }
    })

    return (
        <div className="database-interface-table-wrapper">
            <Table
                className="database-interface-table"
                columns={columns}
                rowKey={record => record.id}
                pagination={{
                    pageSize: parseInt(pagination),
                    current: parseInt(page),
                    size: "default",
                    total: data.total,
                    showSizeChanger: true,
                    simple: true,
                }}
                rowClassName={() => itemDetails ? 'row__clickable' : ''}
                dataSource={data.data}
                loading={loading}
                onChange={handleTableChange}
                scroll={{x: true}}
                onRow={(record, rowIndex) => {
                    return {
                        onClick: () => {
                            setUrl(rowIndex)
                        },
                    };
                }}
            />
            <div className={`pagination ${data.data.length === 0 ? 'pagination__hidden' : ''}`}>
                <span className="pagination--text">show:</span>
                <Select 
                    className="pagination--select"
                    size="small"
                    onChange={(val) => {
                        const newPage = parseInt(page) > Math.ceil(data.total/val) ? Math.ceil(data.total/val) : parseInt(page)
                        setLoading(true)
                        if (useQueryParams){
                            history.push({
                                search: queryString.stringify({
                                    ...queryParams,
                                    pagination: val,
                                    page: newPage
                                })
                            })
                        } else {
                            setPagination(val)
                            setPage(newPage)
                        }
                        
                        // remove additional rows
                        if (data.data.length - val > 0) {
                            setData(({data, ...rest}) => ({...rest, data: data.slice(0, val-1)}))
                        }
                    }}
                    value={pagination}
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
                        resetUrl={resetUrl}
                    />
                </DatabaseTableContext.Provider>
                : null
            }
        </div>
    )
}

export default DatabaseTable

export const ItemDetails = (props) => {
    const {visible, setVisible, details, record, resetUrl} = props
    
    return (
        Number.isInteger(visible) && record ? 
            <Modal
                className="database-interface-table--detail"
                centered
                visible={Number.isInteger(visible)}
                onCancel={() => {resetUrl(); setVisible(false)}}
                footer={null}
            >
                {details(record, setVisible)}
          </Modal>
        : null
        
    )
}