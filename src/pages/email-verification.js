import React from 'react';
import { Spin } from 'antd';
import { useHistory, Redirect } from 'react-router-dom';
import { api} from '../util/util'

const EmailVerification = (props) => {

    const history = useHistory()

    const [requestResolved, setRequestResolved] = React.useState(false)
    const [message, setMessage] = React.useState(null)

    React.useEffect(() => {
        const email_verification_string = props.match.params.emailVerificationString
    
        api.get(`/registration/${email_verification_string}`)
        .then(res => {
            // registered successfully go to login page
            // history.push("/login")
            setMessage('verified')
            setRequestResolved(true)
        }, err => {
            setMessage(err.response.data.error)
            setRequestResolved(true)
            console.log(err.response)
        })
        .catch(err => {
            setMessage(err.response.data.error)
            setRequestResolved(true)
            console.log(err.response)
        })

    }, [history, props.match.params])

    const resolved = 
        <Redirect to={{
            pathname: '/login',
            state: { emailVerification: message },
        }}/>

    return (
        !requestResolved ? <Spin spinning={true} /> : resolved
    )
}

export default EmailVerification