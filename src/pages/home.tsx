import {useHistory, Link} from 'react-router-dom';
import {Button} from 'antd';

// redux
import { useAppSelector } from '../redux/store';
import { selectUser } from '../redux/slices/userSlice'

// pictures
import logo_full from '../images/logo_full.svg';

const Home = () => {

    const { authenticated } = useAppSelector(selectUser)

    const history = useHistory()

    return (
        <>
        {!authenticated ?
        <>
            <div className="home-container">
                <div className="home-container__pic">
                    <img src={logo_full} alt="logo" className="homepage__logo"/>
                </div>
                <div className="home-container__txt">
                    <div className="txt__main-block">
                        <p>Customer manager is the easy way to schedule your appointment online.
                            Create your account and enjoy fast and simple overview of available appointments.</p>
                        <Button
                            onClick={() => {history.push('/login')}}
                            type="primary"
                            size="large"
                        >
                            Login
                        </Button>
                        <Button
                            onClick={() => {history.push('/register')}}
                            // type="primary"
                            size="large"
                        >
                            Sign up
                        </Button>
                    </div>
                </div>
            </div>
            <div className="home-container-base">
            </div>
        </>
        :
        <>
            <h1>Home</h1>
            <p>Customer manager is the easy way to schedule your appointment online. Enjoy fast and simple overview of available appointments.</p>
            <h2>FAQ</h2>
            <ul>
                <li>
                    <h3>How to schedule new appointment?</h3>
                    <p>Go to <Link to="/appointments">New Appointment</Link> section and select interested service. Then select week, day and time slot that suits you the most. Confirm your selections with 'set new apointment' button.</p>
                </li>
                <li>
                    <h3>How can I cancel my appointment?</h3>
                    <p>In order to cancel reserved appointment, you have to choose interesting one on the list in <Link to="/appointments">Appointments</Link> section.</p>
                </li>
            </ul>
        </>
        }
        </>
    )
}

export default Home