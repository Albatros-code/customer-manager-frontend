import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Drawer, Menu } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';

import { useAppData } from '../util/context';
import { api } from '../util/util';

const rootSubmenuKeys = ['sub1', 'sub2', 'sub4'];

const LayoutComp = (props) => {
    const [ isDrawerOpen, setIsDrawerOpen ] = React.useState(false)
    const [ currentPage, setCurrentPage ] = React.useState(useLocation().pathname)

    const { user, setUser } = useAppData()
    const history = useHistory()

    const handleMenuClick = (e) => {
        // console.log('click ', e)
        setCurrentPage(e.key)
    }

    const handleLogout = () => {
        delete api.defaults.headers.common["Authorization"]
        api.post('/logout/refresh', {}, {withCredentials: true})
            .then(res => {
                console.log(res)
                setUser(null)
                history.push("/login")

            }, err => {
                console.log(err.response.data)
            })
    }

    const sideMenu = <SideMenu currentPage={currentPage} handleMenuClick={handleMenuClick}/>

    return (
        <>
        <div className="layout">
            <div className="header">
                    <div className="header-container">
                        <Button 
                            onClick={() => setIsDrawerOpen(true)}
                            shape="circle"
                            className="drawer-button"
                        >
                            <MenuOutlined/>
                        </Button>
                        <span className="title-big">Customer manager</span>
                        <span className="title-small">CM</span>
                    </div>
                <Menu className="navbar" theme="light" mode="horizontal"  onClick={handleMenuClick} selectedKeys={[currentPage]}>
                    {/* defaultSelectedKeys={[useLocation().pathname]}> */}
                    { user ?
                        <Menu.Item key="/login" onClick={handleLogout}><p className="logout-button">{user}</p>Logout</Menu.Item>
                        :
                        <Menu.Item key="/login"><Link to="/login">Login</Link></Menu.Item>
                    }
                    <Menu.Item key="/contact"><Link to="/contact">Contact</Link></Menu.Item>
                    <Menu.Item key="/"><Link to="/">Home</Link></Menu.Item>
                </Menu>
                {/* <Link to="/"><Button type='primary'>Home</Button></Link>
                <Link to="/history"><Button type='primary'>History</Button></Link>
                <Link to="/contact"><Button type='primary'>Contact</Button></Link> */}
            </div>
            <div className="header-grid"></div>
            <div className="sider">
                <div className="sider-fixed">
                {/* /<Menu mode="inline" openKeys={openKeys} onOpenChange={onOpenChange} style={{ width: 256 }}> */}
                    {sideMenu}
                    {/* <div className="sider-content">
                    </div>
                    <div className="sider-scroll">

                    </div> */}
                </div>
            </div>
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
            //style={{ position: 'absolute' }}
        >
            {sideMenu}
        </Drawer>
        </>
    )
}

const SideMenu = (props) => {
    const [openKeys, setOpenKeys] = React.useState(['sub1']);
    
    const { user } = useAppData()
    
    const onOpenChange = keys => {
        const latestOpenKey = keys.find(key => openKeys.indexOf(key) === -1);
        if (rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
        setOpenKeys(keys);
        } else {
        setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
        }
    };

    return (
        <>
            { !user ?
                <div className="sidemenu-loading">
                    <p>Please Log in</p>
                </div>
                :
                <Menu mode="inline" onOpenChange={onOpenChange} onClick={props.handleMenuClick} selectedKeys={[props.currentPage]} className="sidemenu-container">
                    <Menu.ItemGroup key="sub1" icon={<MenuOutlined />} title="User Data">
                        <Menu.Item key="/profile"><Link to="/profile">Profile</Link></Menu.Item>
                        <Menu.Item key="/history"><Link to="/history">History</Link></Menu.Item>
                        
                    </Menu.ItemGroup>
                    <Menu.ItemGroup key="sub2" icon={<MenuOutlined />} title="Appointments">
                        <Menu.Item key="/new-appointment"><Link to="/new-appointment">New appointment</Link></Menu.Item>
                        <Menu.Item key="6">Option 6</Menu.Item>
                    </Menu.ItemGroup>
                </Menu>
            }
        </>
    )
}

export default LayoutComp