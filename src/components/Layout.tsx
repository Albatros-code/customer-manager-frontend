import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Drawer, Menu } from 'antd';
import { MenuOutlined } from '@ant-design/icons';

// redux
import { useAppDispatch, useAppSelector } from '../redux/store'
import { selectUser, logoutUser } from '../redux/slices/userSlice';

// static
import logo from '../images/logo_color.svg';
import logo_full from '../images/logo_full_color.svg';

// types
import { MenuClickEventHandler } from 'rc-menu/lib/interface'

interface ILayoutCompProps {
    children: any
}

const LayoutComp = (props: ILayoutCompProps) => {

    const { role: userRole, authenticated, data  } = useAppSelector(selectUser)
    const { fname } = 'fname' in data ? data : {fname: null}
    const dispatch = useAppDispatch()

    const [ isDrawerOpen, setIsDrawerOpen ] = React.useState(false)
    const [ currentPage, setCurrentPage ] = React.useState<string>('')

    const getCurrentPage = useLocation().pathname

    React.useEffect(() => {
        setCurrentPage(getCurrentPage)
    }, [getCurrentPage])

    const handleMenuClick: MenuClickEventHandler = (e) => {
        setCurrentPage(String(e.key))
        setIsDrawerOpen(false)
    }

    const handleLogout = () => {
        dispatch(logoutUser())
    }

    const sideMenu = <SideMenu userRole={userRole} authenticated={authenticated} currentPage={currentPage} handleMenuClick={handleMenuClick}/>

    return (
        <>
            <div className={`layout ${!authenticated ? 'layout-hide-sider' : ''}`}>
                <div className="header">
                        <div className="header-container">
                            <Button 
                                onClick={() => setIsDrawerOpen(true)}
                                shape="circle"
                                className="drawer-button"
                                style={{
                                    ...(!authenticated ? {display: 'none'} : {})
                                }}
                            >
                                <MenuOutlined/>
                            </Button>
                            <span className="title-big"><Link to="/"><img src={logo_full} alt="logo"/></Link></span>
                            <span className="title-small"><Link to="/"><img src={logo} alt="logo"/></Link></span>
                        </div>
                    <Menu className="navbar" theme="light" mode="horizontal"  onClick={handleMenuClick} selectedKeys={[currentPage]}>
                        {/* defaultSelectedKeys={[useLocation().pathname]}> */}
                        { authenticated ?
                            <Menu.Item key="/login" onClick={handleLogout}><p className="logout-button">{fname}</p>Logout</Menu.Item>
                            :
                            <Menu.Item key="/login"><Link to="/login">Login</Link></Menu.Item>
                        }
                        <Menu.Item key="/contact"><Link to="/contact">Contact</Link></Menu.Item>
                        <Menu.Item key="/"><Link to="/">Home</Link></Menu.Item>
                    </Menu>
                </div>
                <div className="header-grid"></div>
                { authenticated ?
                    <div className="sider">
                        <div className="sider-fixed">
                            {sideMenu}
                        </div>
                    </div>
                    : null
                }
                <div className="layout-inner">
                    <div className="content">{props.children}</div>
                    <div className="footer">Customer manager 2021</div>
                </div>
            </div>
            <Drawer
                className="drawer"
                title="Menu"
                placement="left"
                closable={false}
                onClose={() => setIsDrawerOpen(false)}
                visible={isDrawerOpen}
                getContainer={false}
            >
                {sideMenu}
            </Drawer>
        </>
    )
}

interface ISideMenuProps {
    userRole: string | null,
    authenticated: boolean,
    currentPage: string,
    handleMenuClick: (any: any) => any
}

const SideMenu = (props: ISideMenuProps) => {

    return (
        <>
            { !props.authenticated ?
                <div className="sidemenu-loading">
                    <p>Please Log in</p>
                </div>
                :
                <>
                    <Menu mode="inline" onClick={props.handleMenuClick} selectedKeys={[props.currentPage]} className="sidemenu-container">
                        <Menu.ItemGroup key="sub1" title="User Data">
                            <Menu.Item key="/profile"><Link to="/profile">Profile</Link></Menu.Item>
                            <Menu.Item key="/appointments"><Link to="/appointments">Appointments</Link></Menu.Item>
                            <Menu.Item key="/new-appointment"><Link to="/new-appointment">New Appointment</Link></Menu.Item>
                        </Menu.ItemGroup>

                        {
                            props.userRole === 'admin' ?
                            <Menu.ItemGroup key="sub3" title="Admin">
                                <Menu.Item key="/admin/schedule"><Link to="/admin/schedule">Schedule</Link></Menu.Item>
                                <Menu.Item key="/admin/appointments"><Link to="/admin/appointments">Appointments</Link></Menu.Item>
                                <Menu.Item key="/admin/users"><Link to="/admin/users">Users</Link></Menu.Item>
                                <Menu.Item key="/admin/services"><Link to="/admin/services">Services</Link></Menu.Item>
                                <Menu.Item key="/admin/settings"><Link to="/admin/settings">Settings</Link></Menu.Item>
                                <Menu.Item key="/admin/utils"><Link to="/admin/utils">Utils</Link></Menu.Item>
                            </Menu.ItemGroup>
                            :
                            null
                        }
                    </Menu>
                </>
            }
        </>
    )
}

export default LayoutComp