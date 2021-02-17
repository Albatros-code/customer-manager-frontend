import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { Form, Input, Spin, Button } from 'antd';
import { api } from '../util/util';

function useQuery() {
    return new URLSearchParams(useLocation().search);
  }
  

const ResetPassword = (props) => {

    const history = useHistory()
    
    const query = useQuery()
    const token = query.get("token")

    // React.useEffect(() => {
    //     api.get(`/reset-password?token=${token}&check=True`)
    //         .then(res => {
    //             setIsTokenValid(true)
    //         })
    //         .catch(err => {
    //             console.log('invalid token -> redirecting')
    //         })

    // },[token])

    const [form] = Form.useForm();

    const onFinish = (data) => {
        api.post('/reset-password', 
            {
                token: token,
                action: 'change_password',
                password: data.password,
            }, {withCredentials: true})
            .then(res => {
                console.log('password changed successfully')
                console.log(res)
            }, err => {
                console.log('password not changed')
                console.log(err)
            })
            .catch(err => {
                console.log('server error')
                console.log(err)
            })
            .finally(() => {
                history.push('/login')
            })
    }

    const onFinishFailed = (data) => {
        console.log('Failed submit')
    }

    const resetPasswordForm = 
        <Form
            wrapperCol={{span: 18}}
            labelCol={{span: 6}}
            form={form}
            name="reset-password"
            className="reset-password-form"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            validateTrigger="onSubmit"
            requiredMark={false}
        >
            <Form.Item
                label="New password"
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

            <Form.Item wrapperCol={{sm: {offset: 6, span: 12}}}>
                    <Button type="primary" htmlType="submit" className="login-form-button">
                    Change password
                    </Button>
            </Form.Item>
        </Form>

    return(
        <>
            <h1>Reset password</h1>
            {resetPasswordForm}
        </>
    )
}

export default ResetPassword