import React from 'react'; 
import {Button} from 'antd';

import ModalConfirmation from '../components/ModalConfirmation';
import {api} from '../util/util';

const AdminUtils = (props) => {

    const [resetDatabaseVisible, setResetDatabaseModalVisible] = React.useState(false);

    const resetDatabaseModal = 
        <ModalConfirmation 
            visibilityState={[resetDatabaseVisible, setResetDatabaseModalVisible]}
            title={"Reset database"}
            contentInit={<p>Do you want to reset database?</p>}
            contentResolved={<p>Users and appointments created successfully.</p>}
            contentRejected={<p>Something went wrong</p>}
            onConfirm={() => {
                    return new Promise((resolve, reject) => {
                        api.put('/util/database-reset',
                        // {}, {withCredentials: true}
                        )
                            .then(res => {
                                setTimeout(() => {
                                    return resolve(res)
                                }, 3000);
                            }, err => {
                                return reject(err)
                            })
                            .catch(err => {
                                return reject(err)
                            })
                        })
                }}
            onResolve={
                () => {}
            }
            onReject={
                () => {}
            }
        />

    return (
        <>
            <h1>Demo app utilities</h1>
            <p>Here you can find utilities that might be helpfull to check app's features.</p>

            <h2>Reset database content</h2>
            <p>Function deletes all users beside sample users (User1, User2) and creates bunch of new users and appointments for them for next 4 weeks. Having these data, interfaces available for admin can be  reviewed better.</p>

            <Button style={{display: 'block', marginLeft: 'auto', marginRight: 'auto'}} 
                onClick={() => {
                    setResetDatabaseModalVisible(true)
                }}>Reset database</Button>
            {resetDatabaseModal}

        </>
    )
}

export default AdminUtils