import React from 'react';
import {useLocation, useHistory} from 'react-router-dom';
import {Form, Input, Button, Spin} from 'antd';

// redux
import { logoutUser } from '../redux/slices/userSlice'
import { useAppDispatch } from '../redux/store';

import {api} from '../util/util';
import { user as userModel, resolveRules, mergeErrors } from '../util/data';

import ModalConfirmation from '../components/ModalConfirmation';

function useQuery() {
    return new URLSearchParams(useLocation().search);
  }
  

const ResetPassword = () => {

    const dispatch = useAppDispatch()

    React.useEffect(() =>{
        dispatch(logoutUser())
    }, [dispatch])

    const history = useHistory()
    
    const query = useQuery()
    const token = query.get("token")

    const [form] = Form.useForm();

    const [ errors, setErrors ] = React.useState({})
    const [ formLoading, setFormLoading ] = React.useState(false)
    const [ infoModalVisible, setInfoModalVisible ] = React.useState(false)
    const [ errorModalVisible, setErrorModalVisible ] = React.useState(false)

    const data = resolveRules([
        userModel.password,
        userModel.confirmPassword
    ], {errors: errors})

    const onFinish = (data: {password: string}) => {
        setFormLoading(true)
        api.post('/password-reset/change-password', 
            {
                token: token,
                password: data.password,
            }, {withCredentials: true})
            .then(res => {
                setInfoModalVisible(true)
            }, err => {
                if (err.response.data.hasOwnProperty('errors')){
                    setErrors((prev) => {mergeErrors(err.response.data.errors, prev)})
                    form.validateFields()
                } else {
                    setErrorModalVisible(true)
                }
            })
            .catch(err => {
                setErrorModalVisible(true)
            })
            .finally(() => {setFormLoading(false)})
    }

    const onFinishFailed = () => {
        console.log('Something went wrong.')
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
            validateTrigger="onChange"
            requiredMark={false}
        >
            <Spin spinning={formLoading}>
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
                        <Button type="primary" htmlType="submit" className="login-form-button">
                        Change password
                        </Button>
                </Form.Item>
            </Spin>
        </Form>

    const confirmationModal = 
        <ModalConfirmation
            title={"Password changed successfully"} 
            visibilityState={[infoModalVisible, setInfoModalVisible]}
            modalResolved={'resolved'}
            contentResolved={
                <div>
                    <p>Please use new password to log in to your account.</p>
                </div>
            }
            onResolve={() => history.push("/login")}
        />
    
    const errorModal = 
        <ModalConfirmation
            title={"Something went wrong."}
            visibilityState={[errorModalVisible, setErrorModalVisible]}
            modalResolved={'resolved'}
            contentResolved={
                <div>
                    <p>Password cannot be changed.</p>
                </div>
            }
            onResolve={() => history.push("/login")}
        />

    return(
        <>
            <h1>Reset password</h1>
            {resetPasswordForm}
            {confirmationModal}
            {errorModal}
        </>
    )
}

export default ResetPassword