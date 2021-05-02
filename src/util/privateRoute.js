import { Redirect, Route, useLocation } from 'react-router-dom';

// redux
import { connect } from 'react-redux';

const ProtectedRoute =({ component: Component, authenticated, role, ...rest }) => {
    // const { user } = useAppData()
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

const mapStateToProps = (state) => ({
    authenticated: state.user.authenticated,
    role: state.user.role
})
  
export default connect(mapStateToProps)(ProtectedRoute)