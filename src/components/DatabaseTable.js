import React from "react";
import {Table} from "antd";
import {Input, Space, Button, Select} from "antd";
import { SearchOutlined } from '@ant-design/icons';

import {api} from "../util/util"

const DatabaseTable = (props) => {
    const {dataUrl} = props
    const columns = props.columns(getColumnSearchProps)

    const [data, setData] = React.useState({data: [], total: null})
    const [loading, setLoading] = React.useState(true)
    const [pagination, setPagination] = React.useState({current: 1, pageSize: 10})
    const [filter, setFilter] = React.useState(null)
    const [order, setOrder] = React.useState(null)
        

    React.useEffect(() => {
        function getData(){
            api.get(dataUrl, {
                params: {
                    pagination: pagination.pageSize,
                    page: pagination.current,
                    order: order,
                    filter: filter,
                }})
            .then(res => {
                setData({data: res.data.data, total: res.data.total})
                setLoading(false)
            }) 
        }
        getData()
    },[pagination, filter, order, dataUrl])    

    
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
        let queryString = sorter.order !== undefined ? sorter.order + '_' : ''
        if (sorter.hasOwnProperty('field') && sorter.field.length > 0){
            sorter.field.forEach((item, index) => {
                queryString = queryString + item
                if(sorter.field.length !== index + 1){
                    queryString = queryString + '__'
                }
            })
        }
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
                dataSource={data.data}
                loading={loading}
                onChange={handleTableChange}
                scroll={{x: true}}
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
        </div>
    )
}

export default DatabaseTable