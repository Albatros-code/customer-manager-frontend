import React from 'react';
import {Form} from 'antd';

export const FormContext = React.createContext();

export const useFormContext = () => React.useContext(FormContext);

const FormWrapper = ({ form, children, ...rest }) => {
   
    return (
        <FormContext.Provider value={{form}}>
            <Form 
                form={form}
                {...rest}
            >
                {children}
            </Form>
        </FormContext.Provider>
    );
}

export default FormWrapper