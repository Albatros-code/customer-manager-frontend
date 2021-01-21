import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {

    return (
        <>
            <h1>Page not found</h1>
            <p>Go to <Link to="/">home page</Link>.</p>
        </>
    )
}

export default NotFound