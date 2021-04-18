import React from "react";
import { connect } from "react-redux";

import {getServices} from "../redux/actions/dataActions";

const AdminServices = (props) => {
    
    const {services, getServices} = props
    
    React.useEffect(() => {
        getServices() 
    },[getServices, services])


    return (
        <>
            <h1>Services</h1>
            {services ?
            <ol>
                {services.map(service => (
                    <li key={service.name}>{service.name}</li>
                ))}
            </ol>
            : <p>loading</p>
            }
        </>
    )
}

const mapStateToProps = (state) => ({
    services: state.data.services
})

const mapDispatchToProps = {
    getServices
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminServices)