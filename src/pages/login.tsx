import React from 'react';
// import jwt_decode from "jwt-decode";
import { Form, Input, Button, Checkbox, Spin, Alert, Modal } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useHistory, useLocation } from 'react-router-dom';

// redux
import { useAppDispatch, useAppSelector } from '../redux/store';
import { selectUser, loginUser } from '../redux/slices/userSlice'

import { api } from '../util/util';


const Login = () => {

    const dispatch = useAppDispatch();
    const { authenticated } = useAppSelector(selectUser)
    
    interface ILocation {
        emailVerification: string,
        from: string
    }

    const location = useLocation<ILocation>()
    const history = useHistory<string>()

    const initialRender = React.useRef(true);
    React.useEffect(() => {
        if (initialRender){
            initialRender.current = false
            if (authenticated){
                history.push('/')
            }
        }
    },[history, authenticated])

    interface IErrors {
        [key: string]: string
    }
    
    const [ errors, setErrors ] = React.useState<IErrors>({})
    const [ formLoading, setFormLoading ] = React.useState(false)

    const [form] = Form.useForm();

    interface formValues {
        username: string,
        password: string,
        remember: boolean
    }

    const onFinish = (values: formValues) => {
        if (location.state) location.state.emailVerification = ''
        setFormLoading(true)

        dispatch(loginUser(values.username, values.password, values.remember))
            .then(() => {
                // redirect to proper page
                const push = location.state !== undefined ? location.state.from : '/appointments'
                history.push(push)
            }, (err:{response: any}) => {
                    // set error state in order to validate form fields
                    let skipGeneralError = {}
                    if (err.response) {
                        setErrors({...err.response.data.errors})
                        skipGeneralError = err.response.data.errors.general ? {general_: err.response.data.errors.general} :{}
                    } else {
                        setErrors({general: "Something went wrong."})
                        skipGeneralError = {general_: "Something went wrong."}
                    }
                    form.validateFields()
                        .catch(() => {
                            // clear errors
                            setErrors(skipGeneralError)
                            setFormLoading(false)
                        })
            })
    };

  const onFinishFailed = () => {
        setErrors({});
  };

    const apiErrorValidator = 
        { validator: async (rule:any) => {
            if (errors.hasOwnProperty(rule.field)) {
                return Promise.reject(new Error(errors[rule.field]))
            } else if (errors.hasOwnProperty('general')) {
                return Promise.reject(new Error(' '))
            }
            return Promise.resolve()
        }}

    const errorBar = () => {
        if (location.state && location.state.emailVerification === 'verified'){
            return <Form.Item><Alert message="Email verified" type="success" showIcon /></Form.Item>
        } else if (errors['general_']){
            return <Form.Item><Alert message={errors['general_']} type="error" showIcon /></Form.Item>
        } else {
            return <Form.Item><Alert message="No info" type="info" style={{visibility: 'hidden'}}/></Form.Item>
        }
    }

    // modal
    
    const [formResetPassword] = Form.useForm();
    
    const [resetPasswordModalVisible, setResetPasswordModalVisible] = React.useState(false);
    const [resetPasswordModalLoading, setResetPasswordModalLoading] = React.useState(false);
    const [resetPasswordModalResolved, setResetPasswordModalResolved] = React.useState(false)
    
    const resetPasswordModalButtonProps = {
        ok: {disabled: resetPasswordModalLoading ? true: false},
        cancel: {
            disabled: resetPasswordModalLoading ? true: false,
            style: {display: resetPasswordModalResolved ? 'none' : 'inline-block'}}
    }

    const showResetPasswordModal = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        if (e) e.preventDefault()
        setResetPasswordModalVisible(true);
    };
      
    const resetPasswordModalHandleSendRequest = () => {
        formResetPassword.validateFields()
            .then(data => {
                setResetPasswordModalLoading(true);

                const handleResponse = (response: any) => {
                    setTimeout(() => {
                        setResetPasswordModalResolved(true)
                        setResetPasswordModalLoading(false);
                    }, 1500)
                }

                api.post('/password-reset/send-email',
                    {
                        email: data.email,
                    },
                    {withCredentials: true})
                .then(res => {
                    handleResponse(res)
                }, err => {
                    handleResponse(err)
                })
                .catch(err => {
                    handleResponse(err)
                })
            }, err => {
            })
            .catch(err => {
            })
    };
    
    const resetPasswordModalHandleCancel = () => {
        formResetPassword.resetFields()
        setResetPasswordModalVisible(false)
        setResetPasswordModalResolved(false)
    };
    
    const resetPasswordModalTextInit = 
        <>
            <p>Please insert your e-mail address and follow further instructions.</p>
            <Form
                form={formResetPassword}
                validateTrigger="onChange"
            >
                <Form.Item
                    name="email"
                    rules={[
                        { required: true, message: 'Please input your e-mail!' },
                        { type: 'email', message: "The input is not valid E-mail!"},
                        apiErrorValidator,
                    ]}
                >
                    <Input placeholder="e-mail"/>
                </Form.Item>
            </Form>
        </>

    const resetPasswordModalTextFinal = 
        <p>Email was sent.</p>

    const resetPasswordModal = 
        <Modal
            className="reset-password-modal"
            title="Reset password"
            visible={resetPasswordModalVisible}
            onOk={resetPasswordModalResolved ? resetPasswordModalHandleCancel : resetPasswordModalHandleSendRequest}
            onCancel={resetPasswordModalHandleCancel}
            okButtonProps={resetPasswordModalButtonProps.ok}
            cancelButtonProps={resetPasswordModalButtonProps.cancel}
            okText={resetPasswordModalResolved ? 'Ok' : 'Send request'}
        >
            <Spin spinning={resetPasswordModalLoading}>
                    {resetPasswordModalResolved ?
                        resetPasswordModalTextFinal
                        : resetPasswordModalTextInit}
            </Spin>
        </Modal>

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
                    {/* {location.state && location.state.emailVerification === 'verified' ? <Form.Item><Alert message="Email verified" type="success" showIcon /></Form.Item> : null}
                    {errors['general'] ? <Form.Item><Alert message={errors['general']} type="error" showIcon /></Form.Item> : //null }
                    <Form.Item><Alert message="No info" type="info" style={{visibility: 'hidden'}}/></Form.Item> } */}
                    {errorBar()}
                    <Form.Item
                        name="username"
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
                            <Checkbox>Remember me</Checkbox>
                        </Form.Item>

                        <a className="login-form-forgot" href="/elo" onClick={(e) => showResetPasswordModal(e)}>
                            Forgot password
                        </a>
                    </Form.Item>
                    <Form.Item>
                            <Button type="primary" htmlType="submit" className="login-form-button">
                            Log in
                            </Button>
                        Or <Link to="/register">register now!</Link>
                    </Form.Item>
                </Form>
                {resetPasswordModal}
            </Spin>
        </>
    )
}

export default Login
