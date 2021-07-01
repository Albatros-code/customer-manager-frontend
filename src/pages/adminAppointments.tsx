import DatabaseTable from "../components/DatabaseTable";
import AppointmentsDetails from "../components/AppointmentsDetails";
import {dayjsExtended as dayjs} from '../util/util'

// redux
import { useAppSelector } from "../redux/store";
import { selectData } from "../redux/slices/dataSlice";

// types
import { IAppointmentDoc } from "../interfaces";
import { IDatabaseTable } from "../components/DatabaseTable";


var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

const AdminAppointments = () => {

    const {services} = useAppSelector(selectData)
    
    const columns: IDatabaseTable<IAppointmentDoc>['columns'] = (searchProps) => [
        {
            key: 'id',
            title: 'Id',
            dataIndex: ['id'],
            // sorter: true,
            ellipsis: true,
            width: 70,
            ...searchProps(['id']),
        },
        {
            title: 'Date',
            dataIndex: ['date'],
            sorter: true,
            ellipsis: true,
            width: 150,
            render: (text, record, index) => dayjs(record.date).tz().format('DD-MM-YYYY HH:mm'),
            ...searchProps(['date'], 'date'),
        },
        {
            title: 'Service',
            dataIndex: ['service'],
            sorter: true,
            ellipsis: true,
            render: (text, record, index) => {
                const serviceDoc = services ? services.find((item) => item.id === text) : null
                return serviceDoc ? serviceDoc.name : "deleted " + text
            },
            width: 300,
            ...searchProps(['service']),
        },
    ]

    const itemDetails: IDatabaseTable<IAppointmentDoc>['itemDetails'] = (record, setVisible) => {
        if (!record) return null
        const serviceDoc = services ? services.find((item) => item.id === record.service) : null
        const serviceName = serviceDoc ? serviceDoc.name : "deleted " + record.service
        const title = serviceName + ' on ' + dayjs(record.date).tz().format('DD-MM-YYYY')

        return (
            [<>
                <AppointmentsDetails 
                    doc={record}
                    setVisible={setVisible}
                />
            </>, title]
        )
    } 

    return (
        <>
            <h1>Appointments</h1>
            <DatabaseTable<IAppointmentDoc> 
                columns={columns}
                dataUrl={'/appointments'}
                itemDetails={itemDetails}
                useQueryParams={true}
            />
        </>
    )
}

export default AdminAppointments