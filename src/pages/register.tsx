import React from 'react';
import { Form, Input, Button, Spin} from 'antd';
import { useHistory } from 'react-router-dom';

// redux
import { useAppSelector } from '../redux/store';
import { selectUser } from '../redux/slices/userSlice';

import { api } from '../util/util';
import {user as userModel, resolveRules, mergeErrors} from '../util/data';

import ModalConfirmation from '../components/ModalConfirmation';


const Register = () => {

    const { authenticated } = useAppSelector(selectUser)

    React.useEffect(() => {
        if (authenticated){
            history.push('/')
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    const history = useHistory()
    const [form] = Form.useForm()
    
    const [ errors, setErrors ] = React.useState({})
    const [ formLoading, setFormLoading ] = React.useState(false)
    const [ infoModalVisible, setInfoModalVisible ] = React.useState(false)

    interface IDataItem {
        field: string,
        label: string,
        type: string,
        rules: any[]
    }

    const data:IDataItem[] = resolveRules([
        userModel.username,
        userModel.password,
        userModel.confirmPassword,
        userModel.data.email,
        userModel.data.phone,
        userModel.data.fname,
        userModel.data.lname,
    ], {errors: errors})
    
    const handleSubmit = () => {
        // setFormLoading(true)
    }

    interface formValues {
        username: string,
        password: string,
        email: string,
        phone: string,
        fname: string,
        lname: string,
    }
    
    const onFinish = (values: formValues) => {
        setFormLoading(true)

        api.post('/registration', {
            username: values.username,
            password: values.password,
            email: values.email,
            phone: values.phone,
            fname: values.fname,
            lname: values.lname,
        }, {withCredentials: true})
        .then(res => {
            setInfoModalVisible(true)
            // console.log('register succesfull')
            // console.log(res)
            // registered successfully go to login page
            // history.push("/login")
        }, err => {
            setErrors((prev) => {
                const { errors: {data, ...rest}} = err.response.data
                return mergeErrors({...data, ...rest}, prev)
            })
            form.validateFields()
            setFormLoading(false)
        })
        .catch(err => {
            
        })
    };

    const onFinishFailed = () => {
        
    };

    const fillIn = () => {
        let random = Math.floor(Math.random() * 100000);

        const values = {
            username: `User${random}`,
            password: "12345678",
            confirmPassword: "12345678",
            // email: `user${random}@email.com`,
            email: `customerappemail+${random}@gmail.com`,
            phone: `${Math.floor(100000000 + Math.random() * 900000000)}`,
            fname: 'UserName',
            lname: 'UserLastname'
        }

        form.setFieldsValue(values)
    }

    const clear = () => {
        const values = {
            username: "",
            password: "",
            confirmPassword: "",
            email: '',
            phone: '',
            fname: '',
            lname: ''
        }

        form.setFieldsValue(values)
    }

    const handleKeyPress = (event: { key: string; }) => {
        
        if(event.key === 'f'){
            fillIn()
        }
        if(event.key === 'c'){
            clear()
        }
    }

    return (
        <>
            <h1>Register</h1>
            {/* <Button onClick={fillIn} onKeyPress={handleKeyPress}>fill in</Button>
            <Button onClick={clear}>clear</Button> */}
            
            <Spin spinning={formLoading}>
                <Form
                    wrapperCol={{span: 18}}
                    labelCol={{span: 6}}
                    form={form}
                    name="register"
                    className="register-form"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    validateTrigger="onChange"
                    // validateTrigger="onSubmit"
                    requiredMark={false}
                >
                    {data.map(item => (
                        <Form.Item 
                            label={item.label}
                            name={item.field}
                            rules={item.rules}
                            key={item.field}
                        >
                            {item.field.includes('assword') ? <Input.Password/> : <Input/>}
                        </Form.Item>
                    ))}
                    <Form.Item wrapperCol={{sm: {offset: 6, span: 12}}}>
                            <Button type="primary"  onKeyPress={handleKeyPress} onClick={handleSubmit} htmlType="submit" className="login-form-button">
                            Register
                            </Button>
                    </Form.Item>
                </Form>
            </Spin>
            <ModalConfirmation 
                visibilityState={[infoModalVisible, setInfoModalVisible]}
                modalResolved={
                    <div>
                        <h3>Account created successfully</h3>
                        <p>Email with a confirmation link has been sent to your email address.</p>
                    </div>
                }
                // contentResolved={"Verification email was sent to your e-mail."}
                onResolve={() => history.push("/login")}
                onReject={() => {}}
            />
        </>
    )
}

export default Register