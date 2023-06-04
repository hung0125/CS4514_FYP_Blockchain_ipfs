import React, { useState } from "react";

export const ContextPathSuggester = React.createContext();

export const PathSuggesterProvider = ({children}) => {
    //realtime update
    const [formSuggestPath, addSuggestionPath] = useState('');

    return (
        <ContextPathSuggester.Provider value = {{ 
            formSuggestPath,
            addSuggestionPath
            }}>
            {children}
        </ContextPathSuggester.Provider>
    );
}

