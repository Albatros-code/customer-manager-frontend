import React from 'react';
// import jwt_decode from "jwt-decode";
import { Form, Input, Button, Checkbox, Spin, Alert, Modal } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useHistory, useLocation } from 'react-router-dom';

// redux
import { connect } from 'react-redux';
import { loginUser } from '../redux/actions/userActions';

import { api } from '../util/util';

const Login = (props) => {

    const location = useLocation()
    const history = useHistory()

    React.useEffect(() => {
        if (props.authenticated){
            history.push('/appointments')
        }
    },[props.authenticated, history])

    // console.log(location.state ? location.state.from : 'no /from string')
    
    const [ errors, setErrors ] = React.useState({})
    const [ formLoading, setFormLoading ] = React.useState(false)

    const [form] = Form.useForm();

    const onFinish = (values) => {
        if (location.state) location.state.emailVerification = ''
        setFormLoading(true)

        props.loginUser(values.username, values.password, history)
            .then(res => {
                // redirect to history page
                const push = location.state ? location.state.from : '/appointments'
                console.log('login - redirecting to ' + push)
                history.push(push)
            }, err => {
                    // set error state in order to validate form fields 
                    console.log('LoginUser - error:')
                    console.log(err.response.data.errors)
                    setErrors({...err.response.data.errors})
                    form.validateFields()
                        .catch(() => {
                            // clear errors
                            const skipGeneralError = err.response.data.errors.general ? {general_: err.response.data.errors.general} :{}
                            setErrors(skipGeneralError)
                        })
            })
            .finally(
                setFormLoading(false)
            )
    };

  const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
        setErrors({});
  };

    const apiErrorValidator = 
        { validator: async (rule, value, callback) => {
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

    const showResetPasswordModal = (e) => {
        if (e) e.preventDefault()
        setResetPasswordModalVisible(true);
    };
      
    const resetPasswordModalHandleSendRequest = () => {
        formResetPassword.validateFields()
            .then(data => {
                setResetPasswordModalLoading(true);

                const handleResponse = (response) => {
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
                // console.log(err)
            })
            .catch(err => {
                // console.log(err)
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
                validateTrigger="onSubmit"
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
            {props.authenticated ?
            <p>Logged in as {props.username}</p>
            :
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
                            <Checkbox disabled={true}>Remember me</Checkbox>
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
            }
        </>
    )
}

const mapStateToProps = (state) => ({
    authenticated: state.user.authenticated,
    username: state.user.username
})
  
  const mapDispatchToProps = { loginUser }

export default  connect(mapStateToProps, mapDispatchToProps)(Login)