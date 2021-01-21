import React from 'react';
import jwt_decode from "jwt-decode";
import { Form, Input, Button, Checkbox, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useHistory, useLocation } from 'react-router-dom';

import { api } from '../util/util';
import { useAppData } from '../util/context'

const Login = (props) => {

    const location = useLocation()
    
    const { setUser } = useAppData()
    
    const [ errors, setErrors ] = React.useState({})
    const [ formLoading, setFormLoading ] = React.useState(false)

    const [form] = Form.useForm();
    
    // React.useEffect(() => {
    //     console.log("validate here")
    // },[errors])

    const history = useHistory()

    const handleSubmit = () => {
        // setFormLoading(true)
    }
    
    const onFinish = (values) => {
        setFormLoading(true)

        // make api call to log in (get tokens)
        api.post('/login', {
            username: values.username,
            password: values.password
        }, {withCredentials: true})
        .then(res => {
            // set common authorization header for api calls
            const token = `Bearer ${res.data.access_token}`
            api.defaults.headers.common['Authorization'] = token
            // set user
            const { identity } = jwt_decode(token)
            setUser(identity)
            // redirect to history page
            const push = location.state ? location.state.from : "/history"
            history.push(push)
        }, err => {
            // set error state in order to validate form fields 
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

    return (
        <>
            <h1>Login</h1>
            <Spin spinning={formLoading}>
                <Form
                    form={form}
                    name="normal_login"
                    className="login-form"
                    initialValues={{ remember: false }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    validateTrigger="onSubmit"
                >
                    <Form.Item
                        // validateStatus={errors ? "error" : null}
                        // help={errors ? errors[0] : null}
                        name="username"
                        // rules={[{ required: true, message: 'Please input your Username!' }]}
                        rules={[
                            { required: true, message: 'Please input your Username!' },
                            apiErrorValidator
                        ]}
                    >
                        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Please input your Password!' },
                            apiErrorValidator
                        ]}
                    >
                        <Input.Password
                        prefix={<LockOutlined className="site-form-item-icon" />}
                        type="password"
                        placeholder="Password"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                        <Checkbox disabled={true}>Remember me</Checkbox>
                        </Form.Item>

                        <a className="login-form-forgot" href="/login">
                        Forgot password
                        </a>
                    </Form.Item>

                    <Form.Item>
                            <Button type="primary" onClick={handleSubmit} htmlType="submit" className="login-form-button">
                            Log in
                            </Button>
                        Or <Link to="/register">register now!</Link>
                    </Form.Item>
                </Form>
            </Spin>
        </>
    )
}

export default Login