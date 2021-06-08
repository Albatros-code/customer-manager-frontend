import {Form, Select} from 'antd';

const ServiceSelector = (props) => {

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
                    )) : <Select.Option>no option loaded</Select.Option>}
                </Select>
        </Form.Item>
    )
}

export default ServiceSelector