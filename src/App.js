import React from 'react';
import {
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
import History from './pages/history'
import Contact from './pages/contact'
import Profile from './pages/profile'
import NotFound from './pages/notfound'
import NewAppointment from './pages/newApointment'
import ScheduledAppointments from './pages/scheduledAppointments'
import EmailVerification from './pages/email-verification'
import ResetPassword from './pages/resetPassword'

import AdminAppointments from './pages/adminAppointments'

function App() {

  return (
    <Provider store={store}>
      <RefreshToken>
        <Router>
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

              <ProtectedRoute exact path="/history" component={History}/>
              <ProtectedRoute exact path="/profile" component={Profile}/>
              <ProtectedRoute exact path="/new-appointment" component={NewAppointment}/>
              <ProtectedRoute exact path="/scheduled-appointments" component={ScheduledAppointments}/>
              
              <ProtectedRoute exact path="/admin/appointments" component={AdminAppointments}/>

              <Route component={NotFound} />
            </Switch>
          </Layout>
        </Router>
      </RefreshToken>
    </Provider>
  );
}

export default App;
