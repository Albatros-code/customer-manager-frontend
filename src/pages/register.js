import React from 'react';
import { Form, Input, Button, Spin } from 'antd';
import { useHistory } from 'react-router-dom';

import { api } from '../util/util';

const Register = () => {
    
    const [ errors, setErrors ] = React.useState({})
    const [ formLoading, setFormLoading ] = React.useState(false)

    const [form] = Form.useForm();

    const history = useHistory()

    const handleSubmit = () => {
        // setFormLoading(true)
    }
    
    const onFinish = (values) => {
        setFormLoading(true)

        // make api call to log in (get tokens)
        const options = {
            withCredentials: true
          };

        api.post('/registration', {
            username: values.username,
            password: values.password,
            email: values.email,
            phone: values.phone,
            fname: values.fname,
            lname: values.lname,
        }, options)
        .then(res => {
            // registered successfully go to login page
            history.push("/login")
        }, err => {
            console.log(err.response)
            // set errors, validate form and clear errror
            setErrors({...err.response.data.errors})
            form.validateFields()
                .catch(() => {
                    // clear errors and stop loading
                    setErrors({})
                    setFormLoading(false)
                })
        })
        .catch(err => {
            console.log('catchError: ' + err)
            console.log(err.response)
        })
    };

  const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
  };

    const apiErrorValidator = 
    { validator: async (rule, value, callback) => {
        if (errors.hasOwnProperty(rule.field)) {
            return Promise.reject(new Error(errors[rule.field]))
        }
        return Promise.resolve()
    }}

    const fillIn = () => {
        let random = Math.floor(Math.random() * 100000);

        const values = {
            username: `User${random}`,
            password: "12345678",
            confirmpassword: "12345678",
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
            confirmpassword: "",
            email: '',
            phone: '',
            fname: '',
            lname: ''
        }

        form.setFieldsValue(values)
    }

    return (
        <>
            <h1>Register</h1>
            <Button onClick={fillIn}>fill in</Button>
            <Button onClick={clear}>clear</Button>
            <hr />
            <Spin spinning={formLoading}>
                <Form
                    wrapperCol={{span: 18}}
                    labelCol={{span: 6}}
                    form={form}
                    name="register"
                    className="register-form"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    validateTrigger="onSubmit"
                    requiredMark={false}
                >
                    <Form.Item
                        label="Login"
                        name="username"
                        rules={[
                            { required: true, message: 'Please input your login!' },
                            apiErrorValidator
                        ]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[
                            { required: true, message: 'Please input your Password!' },
                            { min: 8, message: 'The password must contain at least 8 character'}
                        ]}
                    >
                        <Input.Password/>
                    </Form.Item>
                    <Form.Item
                        label="Confirm password"
                        name="confirmpassword"
                        validateTrigger="onChange"
                        rules={[
                            { required: true, message: 'Please confirm your password!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject('Passwords do not match!');
                                },
                            }),
                        ]}
                    >
                        <Input.Password/>
                    </Form.Item>
                    <Form.Item
                        label="E-mail"
                        name="email"
                        rules={[
                            { required: true, message: 'Please input your e-mail!' },
                            { type: 'email', message: "The input is not valid E-mail!"},
                            apiErrorValidator,
                        ]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        label="Phone"
                        name="phone"
                        rules={[
                            { required: true, message: 'Please input your phone number!' },
                            { pattern: "^\\d{9}$", message: "Phone number should have 9 digit."},
                            apiErrorValidator,
                        ]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        label="Name"
                        name="fname"
                        rules={[
                            { required: true, message: 'Please input your Username!' },
                        ]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        label="Last name"
                        name="lname"
                        rules={[
                            { required: true, message: 'Please input your Password!' },
                        ]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item wrapperCol={{sm: {offset: 6, span: 12}}}>
                            <Button type="primary" onClick={handleSubmit} htmlType="submit" className="login-form-button">
                            Register
                            </Button>
                    </Form.Item>
                </Form>
            </Spin>
        </>
    )
}

export default Register