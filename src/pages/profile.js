import React from 'react';
import { useAppData } from '../util/context';

const Profile = () => {

    const { user } = useAppData()

    React.useEffect(() => {
        // fetch user history data
        
    },[])

    return (
        <h1>Profile of {user}</h1>
    )
}

export default Profile