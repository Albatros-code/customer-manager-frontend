import { Redirect, Route, useLocation } from 'react-router-dom';

// redux
import { connect } from 'react-redux';

const ProtectedRoute =({ component: Component, authenticated, ...rest }) => {
    // const { user } = useAppData()
    const location = useLocation()

    return (
        <Route {...rest} render={(props) => (
            authenticated 
            ? <Component {...props} />
            : 
            <Redirect to={{
                pathname: '/login',
                state: { from: location.pathname },
            }} />
        )} />
    )
}

const mapStateToProps = (state) => ({
    authenticated: state.user.authenticated
})
  
export default connect(mapStateToProps)(ProtectedRoute)