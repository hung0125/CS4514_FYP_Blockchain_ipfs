import React from "react";

export const ContextSharedData = React.createContext();

export const SharedDataProvider = ({children}) => {
    var sharedData = {};

    const arrayPush = (key, value) => {
        if (sharedData[key] === undefined)
            sharedData[key] = [value];
        else
            sharedData[key].push(value);
    }

    const dictSet = (key, innerKey, value) => {
        if (sharedData[key] === undefined)
            sharedData[key] = {};
        
        sharedData[key][innerKey] = value;
    }

    return (
        <ContextSharedData.Provider value = {{ 
            sharedData,
            arrayPush,
            dictSet
            }}>
            {children}
        </ContextSharedData.Provider>
    );
}

