import React from "react";
import {Table} from "antd";
import {Input, Space, Button} from "antd";
import { SearchOutlined } from '@ant-design/icons';
import { connect } from "react-redux";

import {api} from "../util/util"

const AdminUsers = (props) => {
    
    const [data, setData] = React.useState(null)
    const [loading, setLoading] = React.useState(true)
    const [paginationTotal, setPaginationTotal] = React.useState(null)
    const [pagination, setPagination] = React.useState({current: 1, pageSize: 10})
    const [filter, setFilter] = React.useState(null)
    const [order, setOrder] = React.useState(null)

    React.useEffect(() => {
        console.log('effect runs')
        function getData(){

            api.get('/users', {
                params: {
                    pagination: pagination.pageSize,
                    page: pagination.current,
                    order: order,
                    filter: filter,
                // }}, {withCredentials: true})
                }})
            .then(res => {
                setData(res.data.data)
                setPaginationTotal(res.data.total)
                setLoading(false)
            }) 
        }
        if (!pagination.hasOwnProperty('total')){
        }
        getData()
    },[pagination, filter, order])    

    
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
                        // searchInput.current = node;
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
    
    const columns = [
        {
            title: 'First Name',
            dataIndex: ['data','fname'],
            sorter: true,
            ellipsis: true,
            width: 140,
            ...getColumnSearchProps(['data','fname']),
        },
        {
            title: 'Last Name',
            dataIndex: ['data','lname'],
            sorter: true,
            ellipsis: true,
            width: 140,
            ...getColumnSearchProps(['data','lname']),
        },
        {
            title: 'Username',
            dataIndex: ['username'],
            sorter: true,
            ellipsis: true,
            width: 135,
            ...getColumnSearchProps(['username']),
        },
        {
            title: 'Email',
            dataIndex: ['data','email'],
            ellipsis: true,
            width: 200,
            ...getColumnSearchProps(['data','email']),
            // responsive: ['sm'],
        },
        {
            title: 'Phone',
            dataIndex: ['data','phone'],
            width: 120,
            ...getColumnSearchProps(['data','phone']),
            // responsive: ['md'],
        },
    ]

    return (
        <>
            <h1>Users</h1>
            <Table
                columns={columns}
                rowKey={record => record.id}
                dataSource={data}
                pagination={{size: "small", ...pagination, total: paginationTotal, showSizeChanger: true, simple: false}}
                loading={loading}
                onChange={handleTableChange}
                scroll={{x: true}}
            />   
        </>
    )
}

const mapStateToProps = (state) => ({
})

const mapDispatchToProps = {
    
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminUsers)