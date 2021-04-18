import React from 'react';
import {
  // HashRouter as Router,
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

// React-redux
import { Provider } from 'react-redux'
import store from './redux/store'

// components
import Layout from './components/layout'

// util
// import { AppDataWraper } from './util/context'
import ProtectedRoute from './util/privateRoute'
import RefreshToken from './util/RefreshToken'


// pages
import Home from './pages/home'
import Login from './pages/login'
import Register from './pages/register'
import Contact from './pages/contact'
import Profile from './pages/profile'
import Appointments from './pages/appointments'
import NotFound from './pages/notfound'
import NewAppointment from './pages/newApointment'
import EmailVerification from './pages/email-verification'
import ResetPassword from './pages/resetPassword'
import AdminServices from './pages/adminServices'
import AdminUsers from './pages/adminUsers'

import AdminAppointments from './pages/adminAppointments'
import Settings from './pages/settings'
import AdminUtils from './pages/adminUtils'



function App() {

  return (
    <Provider store={store}>
      <RefreshToken>
        <Router>
        {/* <Router basename={process.env.REACT_APP_GH_PREFIX}> */}
          <Layout>
            <Switch>
              <Route exact path="/" component={Home}/>
              <Route exact path="/contact" component={Contact}/>
              <Route exact path="/login" component={Login}/>
              <Route exact path="/register" component={Register}/>

              {/* <Route exact path="/email-verified" render={() => (
                <Redirect to={{
                  pathname: '/login',
                  state: { from: '/email-verified' },
                }}/>
              )}/> */}

              <Route exact path="/reset-password" component={ResetPassword}/>

              <Route path="/register/:emailVerificationString" component={EmailVerification}/>

              <ProtectedRoute exact path="/profile" component={Profile}/>
              <ProtectedRoute exact path="/appointments" component={Appointments}/>
              <ProtectedRoute exact path="/new-appointment" component={NewAppointment}/>
              
              <ProtectedRoute exact path="/admin/appointments" component={AdminAppointments}/>
              <ProtectedRoute exact path="/admin/services" component={AdminServices}/>
              <ProtectedRoute exact path="/admin/users" component={AdminUsers}/>
              <ProtectedRoute exact path="/admin/settings" component={Settings}/>
              <ProtectedRoute exact path="/admin/utils" component={AdminUtils}/>
              
              <ProtectedRoute path="/users/:userId" component={Profile}/>

              <Route component={NotFound} />
            </Switch>
          </Layout>
        </Router>
      </RefreshToken>
    </Provider>
  );
}

export default App;
