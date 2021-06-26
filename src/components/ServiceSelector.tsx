import {Form, Select} from 'antd';

interface IServiceSelector {
    handleServiceChange(value: string): void,
    services: {
        id: string,
        name: string,
        duration: number,
    }[]
}

const defaultProps = {
    services: {}
}

const ServiceSelector = (props: IServiceSelector) => {

    const {handleServiceChange, services} = props

    return (
        <Form.Item 
            name="service"
            rules={[
                { required: true, message: 'Please select service!' },
            ]}
        >
                <Select
                    placeholder="Select a service"
                    optionFilterProp="children"
                    disabled={!services}
                    onChange={handleServiceChange}
                >
                    {services ? services.map((item, index) => (
                        <Select.Option value={item.id} key={"service" + index}>{item.name} - {item.duration} min</Select.Option>    
                    )) : <Select.Option value={'no option loaded'}>no option loaded</Select.Option>}
                </Select>
        </Form.Item>
    )
}

ServiceSelector.defaultProps = defaultProps

export default ServiceSelector