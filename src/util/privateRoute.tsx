import { Redirect, Route, useLocation } from 'react-router-dom';

// redux
import { useAppSelector  } from '../redux/store'
import { selectUser  } from '../redux/slices/userSlice'

// import {IReduxState} from '../redux/types'
import {RouteProps} from 'react-router'

interface IProtectedRouteProps {
    component: React.FC<RouteProps>,
    [key: string]: any
}

const ProtectedRoute = ({ component: Component, ...rest }: IProtectedRouteProps) => {
    
    const {authenticated, role} = useAppSelector(selectUser)
    const location = useLocation()

    const isRoleOk = (rest.path.includes('admin') && role === 'admin') || (!rest.path.includes('admin')) ? true : false

    return (
        Component ?
            <Route {...rest} render={(props) => (
                authenticated && isRoleOk
                ? <Component {...props} />
                : 
                <Redirect to={{
                    pathname: '/login',
                    state: { from: location.pathname },
                }} />
            )} />
            :
            <Route {...rest}>
                {
                    authenticated && isRoleOk
                    ? rest.children
                    : 
                    <Redirect to={{
                        pathname: '/login',
                        state: { from: location.pathname },
                    }} />
                }
            </Route>
    )
}

export default ProtectedRoute