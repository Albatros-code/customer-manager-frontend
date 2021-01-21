import { Redirect, Route, useLocation } from 'react-router-dom';
import { useAppData } from './context'

const ProtectedRoute =({ component: Component, ...rest }) => {
    const { user } = useAppData()
    const location = useLocation()

    return (
        <Route {...rest} render={(props) => (
            user 
            ? <Component {...props} />
            : 
            <Redirect to={{
                pathname: '/login',
                state: { from: location.pathname },
            }} />
        )} />
    )
  }

export default ProtectedRoute