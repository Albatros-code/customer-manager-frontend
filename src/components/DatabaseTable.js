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
    // const mobile = isMobile()
    const {dataUrl, itemDetails, useQueryParams, handleRowClick, paginationHidden} = props
    
    // React.useEffect(() => {
    //     console.log('rerender DatabaseTable')
    //     if (props.forceUpdate !== 0) getData()
    // },[getData, ])

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
    const filter = props.filterQuery ? 
        props.filterQuery 
        :
        (useQueryParams ? filterQuery : filterState)
    
    const [loading, setLoading] = React.useState(true)
    const [data, setData] = React.useState({data: [], total: null})
    const [sortedInfo, setSortedInfo] = React.useState({})
    const [filteredInfo, setFilteredInfo] = React.useState({})
    const [detailsVisible, setDetailsVisible] = React.useState(false)


    const getData = React.useCallback(() => {

        setLoading(true)
        setDetailsVisible(false)

        api.get(dataUrl, {
            params: {
                pagination: pagination,
                page: page,
                order: props.orderQuery ? props.orderQuery : order,
                filter: filter,
            }})
            .then(res => {
                setData({data: res.data.data, total: res.data.total})
                setLoading(false)
                setSortedInfo(order ? orderToOrderInfo(order) : {})
                if(!props.filterQuery){
                    setFilteredInfo(filter ? filterToFilteredInfo(filter) : {})
                } else {
                    setPage(page > Math.ceil(res.data.total/pagination) ? 1 : page)
                }
            }, err => {
                setData({data: 0, total: 0})
                setLoading(false)
        }) 
    }, [dataUrl, filter, order, page, pagination, props.filterQuery, props.orderQuery]);
    
    React.useEffect(() => {
        getData()
    },[getData, props.forceUpdate])

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
                const dataIndexString = key.split('__gt')[0].split('__lt')[0]
                composedFilters[dataIndexString] = {...composedFilters[dataIndexString], [key]: value}
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
    
    const handleReset = (selectedKeys, dataIndex, confirm, type) => {
        const removeSingleFilter = () => {
            if (filter) {
                if (type !== 'date'){
                    const {[Object.keys(getFilterQuery(dataIndex, selectedKeys))[0]]: remove, ...rest} = {...JSON.parse(filter)}
                    return Object.keys(rest).length !== 0 ? {filter: JSON.stringify(rest)} : null
                } else {
                    let newFilter = filter ? {...JSON.parse(filter)} : {}
                    delete newFilter[dataIndex.join().replace(',', '__') + '__gt']
                    delete newFilter[dataIndex.join().replace(',', '__')  + '__lt']
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
                setFilter(null)
            }
        }
        
        confirm();
    };

    const handleTableChange = (pagination, filters, sorter, extra) => {
        if (extra.action === 'filter') return

        const {order: excluded, ...restQueryParams} = queryParams
        const order = getOrderQuery(sorter) ? {order: getOrderQuery(sorter)} : (useQueryParams ? {} : null)
        
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
        }
    }

    function setUrl(rowIndex){
        
        if (useQueryParams){
            const {showRow, ...newQueryParams} = queryParams
            const rowIndexQueryParam = parseInt(rowIndex) >= 0 ? {showRow: rowIndex} : {}
            
            history.push({
                search: queryString.stringify({
                    ...newQueryParams,
                    ...rowIndexQueryParam,
                })
            })
        } else {
            setDetailsVisible(rowIndex)
        }
        
    }

    const handleDateSelect = (setSelectedKeys, dataIndex, type, dateString, selectedKeys) => {
        let prev = selectedKeys[0] ? JSON.parse(selectedKeys[0]) : {}

        if (dateString !== '') {
            setSelectedKeys([JSON.stringify({...prev, [dataIndex.join().replace(',', '__') + '__' + type]: dateString})])
        } else {
            delete prev[dataIndex.join().replace(',', '__') + '__' + type]
            setSelectedKeys(Object.keys(prev).length > 0 ? [JSON.stringify(prev)] : [])
        }

    }

    const handleDateSearch = (selectedKeys, confirm, dataIndex) => {
        const selectedKeysObj = selectedKeys[0] ? JSON.parse(selectedKeys[0]) : {}
        const startDateString = selectedKeysObj.hasOwnProperty(dataIndex.join().replace(',', '__') + '__gt') ? selectedKeysObj[dataIndex.join().replace(',', '__') + '__gt'] : null
        const endDateString = selectedKeysObj.hasOwnProperty(dataIndex.join().replace(',', '__') + '__lt') ? selectedKeysObj[dataIndex.join().replace(',', '__') + '__lt'] : null
        
        if (startDateString || endDateString){
            const {[dataIndex.join().replace(',', '__') + '__gt']: remove1, [dataIndex.join().replace(',', '__') + '__lt']: remove2, ...filterObj} = {...JSON.parse(filter)}
            
            if (useQueryParams){
                history.push({
                    search: queryString.stringify({
                        ...queryParams,
                        page: 1,
                        filter: JSON.stringify({...filterObj, ...JSON.parse(selectedKeys[0])})
                    })
                })
            } else {
                setPage(1)
                setFilter(JSON.stringify({...filterObj,  ...JSON.parse(selectedKeys[0])}))
            }
            confirm();
        }
    }

    const getColumnSearchProps = (dataIndex, type, label) => {
        let searchField = null
        
        switch (type) {
            case 'date':
                // if (mobile) return {}
                return ({
                    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => {
                        const selectedKeysObj = selectedKeys[0] ? JSON.parse(selectedKeys[0]) : {}
                        const startDateString = selectedKeysObj.hasOwnProperty(dataIndex.join().replace(',', '__') + '__gt') ? selectedKeysObj[dataIndex.join().replace(',', '__') + '__gt'] : null
                        const endDateString = selectedKeysObj.hasOwnProperty(dataIndex.join().replace(',', '__') + '__lt') ? selectedKeysObj[dataIndex.join().replace(',', '__') + '__lt'] : null
        
                        return(
                            <Space style={{ padding: 8 }} direction='vertical'>
                                <DatePicker
                                    inputReadOnly={true}
                                    onChange={(momentObj, dateString) => handleDateSelect(setSelectedKeys, dataIndex, 'gt', dateString, selectedKeys)}
                                    style={{width: '100%'}}
                                    placeholder='Start Date'
                                    value={startDateString ? moment(startDateString, 'YYYY-MM-DD') : null}
                                />
                                <DatePicker
                                    inputReadOnly={true}
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
                                        onClick={() => handleReset(selectedKeys, dataIndex, confirm, type)}
                                        size="small"
                                        // disabled={!(startDateString || endDateString)}
                                        style={{ width: 90 }}
                                        // disabled={!filter || !filteredInfo[dataIndex.join().replace(',', '__')]}
                                        disabled={!filter || !filteredInfo[dataIndex.join()]}
                                    >
                                        Reset
                                    </Button>
                                </Space>
                            </Space>
                    )},
                    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
                    filteredValue: filteredInfo[dataIndex],
                    sortOrder: sortedInfo.hasOwnProperty('field') && sortedInfo.field.join() === dataIndex.join().replace(',', '__') && sortedInfo.order
                    
                })
            default:
                return ({
                    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, visible }) => {
                        return(
                            <div style={{ padding: 8 }}>
                                <Input
                                    ref={node => {
                                        searchField = node;
                                    }}
                                    placeholder={`Search ${label ? label : dataIndex}`}
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
                                        disabled={!selectedKeys[0]}
                                    >
                                        Search
                                    </Button>
                                    <Button 
                                        onClick={() => {handleReset(selectedKeys, dataIndex, confirm)}}
                                        size="small"
                                        style={{ width: 90 }}
                                        // disabled={!filter || !filteredInfo[dataIndex.join().replace(',', '__')]}
                                        disabled={!filter || !filteredInfo[dataIndex.join()]}
                                    >
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
                    filterDropdownVisible: null,
                    filteredValue: filteredInfo[dataIndex],
                    sortOrder: sortedInfo.hasOwnProperty('field') && sortedInfo.field.join() === dataIndex.join().replace(',', '__') && sortedInfo.order
                })

            
        }
    }

    const columns = props.columns(getColumnSearchProps).map(item => {
        if (item.hasOwnProperty('sorter') && item.sorter && !item.hasOwnProperty('sortOrder')){
            return {
                ...item,
                sortOrder: sortedInfo.hasOwnProperty('field') && sortedInfo.field.join() === item.dataIndex.join().replace(',', '__') && sortedInfo.order
            }
        } else {
            return item
        }
    })

    return (
        <div className="database-interface-table-wrapper">
            <Table
                className={`database-interface-table ${paginationHidden ? 'database-interface-table__hidden' : ''}`}
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
                scroll={{x: '100%'}}
                onRow={(record, rowIndex) => {
                    
                    return !handleRowClick ? 
                        {
                            onClick: () => {
                                setUrl(rowIndex)
                            },
                        }
                        :
                        {
                            onClick: () => handleRowClick(record, rowIndex)
                        }

                }}
            />
            <div className={`pagination ${data.data.length === 0 || paginationHidden ? 'pagination__hidden' : ''}`}>
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
                        // setVisible={setDetailsVisible}
                        setVisible={setUrl}
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
    const computedDetails = record && details(record, setVisible)
    const computedDetailsArray = Array.isArray(computedDetails) ? computedDetails : [computedDetails]

    const [content, title] = computedDetails ? computedDetailsArray : ['content', 'title']

    return (
        Number.isInteger(visible) && record ? 
            <Modal
                title={title ? title : `Details`}
                destroyOnClose={true}
                className="database-interface-table--detail"
                centered
                visible={Number.isInteger(visible)}
                onCancel={() => {
                    if(resetUrl) resetUrl()
                    setVisible(false)
                }}
                footer={null}
            >
                {content}
          </Modal>
        : null
        
    )
}