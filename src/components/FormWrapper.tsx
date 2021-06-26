import React from 'react';
import {Form} from 'antd';
import { FormInstance } from 'antd/lib/form';

export const FormContext = React.createContext<any>(null);

export const useFormContext = () => React.useContext(FormContext);

interface IFormWrapper {
    form: FormInstance,
    children: React.ReactNode,
    [key: string]: any,
}

const FormWrapper = ({ form, children, ...rest }: IFormWrapper) => {
   
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