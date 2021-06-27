import React from "react";
import {Table} from "antd";
import {Input, Space, Button, Select, Modal, DatePicker} from "antd";
import {SearchOutlined} from '@ant-design/icons';
import queryString from 'query-string'
import {useHistory, useLocation} from 'react-router-dom';

import {api} from "../util/util"
import {dayjsExtended as dayjs} from '../util/util'
// TODO: change moment to day js in AntDesign
import moment from "moment";

//types
import { FilterDropdownProps, ColumnType } from 'antd/lib/table/interface'
import { TableProps } from 'antd/lib/table/Table'

var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

interface IDatabaseTableContext {
    updateTableContent: () => void;
  }

export const DatabaseTableContext = React.createContext<IDatabaseTableContext | null>(null);

export const useDatabaseTableContext = () => React.useContext(DatabaseTableContext);

interface IDatabaseTable<R extends {id: string}> {
    dataUrl: string,
    itemDetails: React.ReactNode,
    useQueryParams: boolean,
    handleRowClick(record: R, rowIndex: number | undefined): void,
    paginationHidden: boolean,
    filterQuery?: string,
    orderQuery?: string,
    forceUpdate?(): void,
    columns: (searchProps: (dataIndex: string[], type: string, label: string) => ColumnType<any>) => [{
        key: string,
        title: string,
        dataIndex: string[],
        sorter?: boolean,
        ellipsis?: boolean,
        width?: number,
    } & FilterDropdownProps]
}

interface IQueryParams {
    pagination?: number,
    page?: number,
    order?: string,
    filter?: string,
    showRow?: number,
}

export default function DatabaseTable<R extends {id: string}>(props: IDatabaseTable<R>): JSX.Element{
    const history = useHistory()

    const {dataUrl, itemDetails, useQueryParams, handleRowClick, paginationHidden} = props

    const location = useLocation<{search: string}>()
    const queryParams = queryString.parse(location.search)
    
    const {
        pagination: paginationQuery = 10,
        page: pageQuery = 1,
        order: orderQuery = undefined,
        filter: filterQuery = undefined,
        showRow: showRowQuery = undefined
    }:IQueryParams = queryParams
    
    const [paginationState, setPagination] = React.useState(10)
    const [pageState, setPage] = React.useState(1)
    const [orderState, setOrder] = React.useState<string | undefined>(undefined)
    const [filterState, setFilter] = React.useState<string | undefined>(undefined)

    const pagination = useQueryParams ? paginationQuery : paginationState
    const page = useQueryParams ? pageQuery : pageState
    const order = useQueryParams ? orderQuery : orderState
    const filter = props.filterQuery ? 
        props.filterQuery 
        :
        (useQueryParams ? filterQuery : filterState)
    
    const [loading, setLoading] = React.useState(true)
    const [data, setData] = React.useState<{data: Array<R>, total: number}>({data: [], total: 0})
    const [sortedInfo, setSortedInfo] = React.useState<{[key: string]: any}>({})
    const [filteredInfo, setFilteredInfo] = React.useState<{[key: string]: any}>({})
    const [detailsVisible, setDetailsVisible] = React.useState<number | undefined>(undefined)

    const getData = React.useCallback(() => {

        setLoading(true)
        setDetailsVisible(undefined)

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
                setData({data: [], total: 0})
                setLoading(false)
        }) 
    }, [dataUrl, filter, order, page, pagination, props.filterQuery, props.orderQuery]);
    
    React.useEffect(() => {
        getData()
    },[getData, props.forceUpdate])

    React.useEffect(() => {
        if (useQueryParams){
            setDetailsVisible(showRowQuery)
        }
    },[showRowQuery, useQueryParams])

    // function clearQuery(){
    //     setFilteredInfo({});
    //     setSortedInfo({});
    //     history.push({
    //         search: ''
    //     })
    // };
    
    function filterToFilteredInfo(filter: string){
        
        const filterObj = JSON.parse(filter)
        const newObj = Object.fromEntries(Object.entries<string>(filterObj).map(([key, val]) => {
            
            if (key.includes('__gt') || key.includes('__lt')){
                return [key, val]
            }

            const newKey = key.toString().substring(0, key.lastIndexOf('__')).replace("__", ",")
            const newVal = [val]
            return [newKey, newVal]
        }))
                
        let composedFilters:{[key: string]: {[key: string]: string} | [string]} = {}
        for (const [key, value] of Object.entries<string>(newObj)) {
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

    function orderToOrderInfo(order: string){
        const orderVal = order.toString().replace('__', '-').split("_")[0]
        const fieldVal = order.toString().replace('__', '-').split("_")[1].split("-")
        const sorterObj = {
            order: orderVal,
            field: fieldVal,
        }
        
        return sorterObj
    }

    function getOrderQuery(sorter: {[key: string]: any}): string{
        let queryString = ''
        if (sorter.order && sorter.order !== undefined){
            queryString = sorter.order + '_'
        } else {
            return queryString
        }

        sorter.field.forEach((item: string, index: number) => {
            queryString = queryString + item
            if(sorter.field.length !== index + 1){
                queryString = queryString + '__'
            }
        })
        return queryString
    }
    
    function getFilterQuery(dataIndex: string[], selectedKeys: FilterDropdownProps["selectedKeys"]){
        return (
            {[dataIndex.toString().replace(',', '__') + '__icontains']: selectedKeys[0]}
        )
    }

    const handleSearch = (selectedKeys: FilterDropdownProps["selectedKeys"], confirm: FilterDropdownProps["confirm"], dataIndex: string[]) => {
        if (selectedKeys.length !== 0){
            const currentFilter = filter ? JSON.parse(filter) : null
             if (useQueryParams){
                history.push({
                    search: queryString.stringify({
                        ...queryParams,
                        page: 1,
                        filter: JSON.stringify({...currentFilter, ...getFilterQuery(dataIndex, selectedKeys)})
                    })
                })
            } else {
                setPage(1)
                setFilter(JSON.stringify({...currentFilter, ...getFilterQuery(dataIndex, selectedKeys)}))
            }
            confirm();
        } 
    };
    
    const handleReset = (selectedKeys: FilterDropdownProps["selectedKeys"], dataIndex: string[], confirm: FilterDropdownProps["confirm"], type?: string) => {
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
                setFilter(undefined)
            }
        }
        
        confirm();
    };

    const handleTableChange:TableProps<R>["onChange"] = (pagination, filters, sorter, extra) => {
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
        } else if (pagination.current && pagination.pageSize) {
            setPage(pagination.current)
            setPagination(pagination.pageSize)
            if (order) {
                setOrder(order.order)
            } else {
                setOrder(undefined)
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

    function setUrl(rowIndex: number | undefined){
        
        if (useQueryParams){
            const {showRow, ...newQueryParams} = queryParams
            const rowIndexQueryParam = (rowIndex || rowIndex === 0) ? {showRow: rowIndex} : {}
            
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

    const handleDateSelect = (
        setSelectedKeys: (selectedKeys: React.Key[]) => void,
        dataIndex: string[],
        type: string,
        dateString: string,
        selectedKeys: React.Key[]
    ) => {
        let prev = selectedKeys[0] ? JSON.parse(String(selectedKeys[0])) : {}

        if (dateString !== '') {
            setSelectedKeys([JSON.stringify({...prev, [dataIndex.join().replace(',', '__') + '__' + type]: dateString})])
        } else {
            delete prev[dataIndex.join().replace(',', '__') + '__' + type]
            setSelectedKeys(Object.keys(prev).length > 0 ? [JSON.stringify(prev)] : [])
        }

    }

    const handleDateSearch = (selectedKeys: React.Key[], confirm: FilterDropdownProps["confirm"], dataIndex: string[]) => {
        const selectedKeysObj = selectedKeys[0] ? JSON.parse(String(selectedKeys[0])) : {}
        const startDateString = selectedKeysObj.hasOwnProperty(dataIndex.join().replace(',', '__') + '__gt') ? selectedKeysObj[dataIndex.join().replace(',', '__') + '__gt'] : null
        const endDateString = selectedKeysObj.hasOwnProperty(dataIndex.join().replace(',', '__') + '__lt') ? selectedKeysObj[dataIndex.join().replace(',', '__') + '__lt'] : null
        
        if (filter && (startDateString || endDateString)){
            const {[dataIndex.join().replace(',', '__') + '__gt']: remove1, [dataIndex.join().replace(',', '__') + '__lte']: remove2, ...filterObj} = {...JSON.parse(filter)}
            
            if (useQueryParams){
                history.push({
                    search: queryString.stringify({
                        ...queryParams,
                        page: 1,
                        filter: JSON.stringify({...filterObj, ...JSON.parse(String(selectedKeys[0]))})
                    })
                })
            } else {
                setPage(1)
                setFilter(JSON.stringify({...filterObj,  ...JSON.parse(String(selectedKeys[0]))}))
            }
            confirm();
        }
    }

    const getColumnSearchProps = (dataIndex: string[], type: string, label: string): ColumnType<any> => {
        let searchField: Input | null
        
        switch (type) {
            case 'date':
                // if (mobile) return {}
                return ({
                    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => {
                        const selectedKeysObj = selectedKeys[0] ? JSON.parse(String(selectedKeys[0])) : {}
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
                                    onChange={(momentObj, dateString) => {
                                        // const nextDayString = moment(momentObj).add({day: 1}).format("YYYY-MM-DD")

                                        return (
                                            handleDateSelect(setSelectedKeys, dataIndex, 'lt', dateString, selectedKeys)
                                        )
                                    }}
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
                                        style={{ width: 90 }}
                                        disabled={!filter || !filteredInfo[dataIndex.join()]}
                                    >
                                        Reset
                                    </Button>
                                </Space>
                            </Space>
                    )},
                    filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
                    filteredValue: filteredInfo[dataIndex.join()],
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
                        const fieldNotNull = searchField ? searchField : null
                        if (fieldNotNull && visible) {
                            setTimeout(() => fieldNotNull.select(), 100);
                        }
                    },
                    // filterDropdownVisible: null,
                    filteredValue: filteredInfo[dataIndex.join()],
                    sortOrder: sortedInfo.hasOwnProperty('field') && sortedInfo.field.join() === dataIndex.join().replace(',', '__') && sortedInfo.order
                })

            
        }
    }

    const columns = props.columns(getColumnSearchProps).map(item => {
        if (item.hasOwnProperty('sorter') && item.sorter && 'field' in sortedInfo){
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
                className={`database-interface-table ${paginationHidden ? 'database-interface-table__hidden' : ''}`}
                columns={columns}
                rowKey={record => record.id}
                pagination={{
                    pageSize: pagination,
                    current: page,
                    size: "default",
                    total: data.total,
                    showSizeChanger: true,
                    simple: true,
                }}
                rowClassName={() => (itemDetails || handleRowClick) ? 'row__clickable' : ''}
                dataSource={data.data}
                loading={loading}
                onChange={handleTableChange}
                scroll={{x: '100%'}}
                onRow={(record, rowIndex) => {
                    const rowIndexNumber = (rowIndex || rowIndex === 0) ? rowIndex as number : undefined
                    return !handleRowClick ? 
                        {
                            onClick: () => {
                                setUrl(rowIndexNumber)
                            },
                        }
                        :
                        {
                            onClick: () => handleRowClick(record, rowIndexNumber)
                        }

                }}
            />
            <div className={`pagination ${data.data.length === 0 || paginationHidden ? 'pagination__hidden' : ''}`}>
                <span className="pagination--text">show:</span>
                <Select 
                    className="pagination--select"
                    size="small"
                    onChange={(val) => {
                        const newPage = page > Math.ceil(data.total/val) ? Math.ceil(data.total/val) : page
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
            {!loading && itemDetails ?
                <DatabaseTableContext.Provider value={{
                    updateTableContent: getData
                }}>
                    <ItemDetails 
                        visible={detailsVisible}
                        setVisible={setUrl}
                        record={detailsVisible ? data.data[detailsVisible] : detailsVisible}
                        details={itemDetails}
                        resetUrl={resetUrl}
                    />
                </DatabaseTableContext.Provider>
                : null
            }
        </div>
    )
}

interface ItemDetailsProps<R> {
    visible: number | undefined,
    setVisible: (visible: number | undefined) => void,
    details: any,
    record: R | undefined,
    resetUrl?: () => void,
}

export function ItemDetails<R>(props: ItemDetailsProps<R>){
    const {visible, setVisible, details, record, resetUrl} = props
    const computedDetails = record && details(record, setVisible)
    const computedDetailsArray = Array.isArray(computedDetails) ? computedDetails : [computedDetails]

    const [content, title] = computedDetails ? computedDetailsArray : ['content', 'title']

    return (
        <Modal
            title={title ? title : `Details`}
            destroyOnClose={true}
            className="database-interface-table--detail"
            centered
            visible={(visible || visible === 0)? true : false}
            onCancel={() => {
                if(resetUrl) resetUrl()
                setVisible(undefined)
            }}
            footer={null}
        >
            {content}
        </Modal>
        
    )
}