import React from 'react';

export function useForceUpdate(){
    const [value, setValue] = React.useState(0); // integer state
    return {forceUpdate: () => setValue(value => value + 1), update: value}; // update the state to force render
}