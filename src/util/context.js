import React from "react";
import jwt_decode from 'jwt-decode';
import { api } from './util'

export const AppContext = React.createContext([]);

export const useAppData = () => React.useContext(AppContext);

export const AppDataWraper = ({ children }) => {
    const [user, setUser] = React.useState(null);
    const [working, setWorking] = React.useState(true);
  
    const refreshToken = () => {
        delete api.defaults.headers.common['Authorization']

        api.post('/token/refresh', '', {withCredentials: true})
        .then(res => {
            console.log('token/refresh succesfull')

            const token = `Bearer ${res.data.access_token}`
            const { identity, iat, exp } = jwt_decode(token)

            api.defaults.headers.common['Authorization'] = token
            setUser(identity)

            setTimeout(() => {
                refreshToken()
                }, ((exp - iat) * 1000) - 500)
            // console.log((exp - iat)/60 + ' min')

        }, err => {
            // console.error("token/refresh - useEffect", err.response.data)            
        })
        .catch(err => {
            // console.log(err)
        })
        .finally(() => {
            setWorking(false)
        })
    }

    //   client
    //     .request(refresh_token)
    //     .then(({ refresh_token: { customer, token, expires_in } }) => {
    //       client.setHeader("authorization", `Bearer ${token}`);
  
    //       setTimeout(() => {
    //         refreshToken()
    //       }, (expires_in * 1000) - 500)
  
    //       setCustomer(customer);
    //     })
    //     .catch(console.log)
    //     .finally(() => {
    //       setWorking(false);
    //     });
    // };
  
    React.useEffect(() => {
        refreshToken();
        // eslint-disable-next-line
    }, []);

    return (
        <AppContext.Provider value={{ user, setUser }}>
            {working ? null : children}
        </AppContext.Provider>
    );
}
