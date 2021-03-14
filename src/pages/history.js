import React from 'react';
import dayjs from 'dayjs';
import { Table } from 'antd';

import { connect } from 'react-redux'

import { api } from '../util/util'

const History = (props) => {

    const { fname, lname } = props
    const [ historyData, setHistoryData ] = React.useState(null)

    React.useEffect(() => {
        // fetch user history data
        api.get('/history', '', {withCredentials: true})
        .then(res => {
            // console.log(res)
            setHistoryData(res.data)
        }, err => {
            console.log(err.response)
        })
        .catch(err => {
            console.log(err)
        })
        
    },[setHistoryData])

    // const now = dayjs()
    const columns = [
        {
            title: 'Service',
            dataIndex: 'service',
            key: 'service',
        },
        {
            title: 'Day',
            dataIndex: 'day',
            key: 'day',
        },
        {
            title: 'Time',
            dataIndex: 'time',
            key: 'time',
        },
    ]

    const data = historyData ? historyData.map((item, index) => {
        let date = dayjs(item.date)
        return ({
            key: index,
            service: item.service,
            day: date.format('DD-MM-YYYY'),
            time: date.format('HH:mm'),
        })
    }) : null

    // const data = [
    //     {
    //         key: '1',
    //         service: 'John Brown',
    //         date: 32,
    //     },
    //     {
    //         key: '2',
    //         service: 'John Brown',
    //         date: 32,
    //     },
    // ]

    return (
        <>
        <h1>History of {fname} {lname}</h1>
        {/* <p>current time ISO: {now.toISOString()}</p>
        <p>current time local: {now.format('DD-MM-YYYY HH:mm')}</p> */}
        {historyData ? <Table  pagination={{hideOnSinglePage: true}} columns={columns} dataSource={data}/> : null}
        </>
    )
}

const mapStateToProps = (state) => ({
    username: state.user.username,
    fname: state.user.data.fname,
    lname: state.user.data.lname,
})

export default connect(mapStateToProps)(History)