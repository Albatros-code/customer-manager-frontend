import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import Layout from './components/layout'
import { AppDataWraper } from './util/context'
import ProtectedRoute from './util/privateRoute'

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

function App() {
  return (
    <AppDataWraper>
      <Router>
        <Layout>
          <Switch>
          <Route exact path="/" component={Home}/>
            <Route exact path="/contact" component={Contact}/>
            <Route exact path="/login" component={Login}/>
            <Route exact path="/register" component={Register}/>

            <ProtectedRoute exact path="/history" component={History}/>
            <ProtectedRoute exact path="/profile" component={Profile}/>
            <ProtectedRoute exact path="/new-appointment" component={NewAppointment}/>
            <ProtectedRoute exact path="/scheduled-appointments" component={ScheduledAppointments}/>
            

            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Router>
    </AppDataWraper>
  );
}

export default App;
