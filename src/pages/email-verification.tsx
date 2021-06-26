import React from 'react';
import { Spin } from 'antd';
import { useHistory, Redirect } from 'react-router-dom';
import { api} from '../util/util'

interface IEmailVerification {
    match: {
        params: {
            emailVerificationString: string
        }
    }
}

const EmailVerification = (props: IEmailVerification) => {

    const history = useHistory()

    const [requestResolved, setRequestResolved] = React.useState(false)
    const [message, setMessage] = React.useState<null | string>(null)

    React.useEffect(() => {
        const email_verification_string = props.match.params.emailVerificationString
    
        api.get(`/registration/${email_verification_string}`)
        .then(() => {
            setMessage('verified')
            setRequestResolved(true)
        })
        .catch(err => {
            setMessage(err.response.data.error)
            setRequestResolved(true)
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