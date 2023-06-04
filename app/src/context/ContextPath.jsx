//Will be completely removed later, DON'T learn from this file
import React from "react";

export const ContextPath = React.createContext();

export const PathProvider = ({ children }) => {
    //realtime update
    var paths = [];
    var treePaths = [];
    var pathDict = new Map();
    var readyCount = 0;

    const findPathSuggestions = (searchStr) => {
        return paths.filter(substring => substring.toLowerCase().includes(searchStr.toLowerCase())).sort();
    }

    const addPath = (metadata, blockData) => {
        if (!metadata.path)
            console.log('path error');

        //use Map to make search efficient
        if (!pathDict.get(metadata.path)) {
            paths.push(metadata.path);
            pathDict.set(metadata.path, true);
        }
        treePaths.push([metadata.path, metadata, blockData]);
    }

    const updateReady = () => {
        readyCount++;
    }

    const getReady = () => {
        return readyCount;
    }

    const getTreePathDict = () => {
        // sort the tree paths by blockID desc, the path add order is depended by the request response time, not by blockchain DB 
        treePaths = treePaths.sort((a, b) => parseInt(a[2].blockID, 16) > parseInt(b[2].blockID, 16) ? -1 : 1);

        // Create an empty tree object
        let tree = {};

        // Iterate over the list of file path strings
        for (let i = 0; i < treePaths.length; i++) {
            // Split the file path string into its components
            let components = treePaths[i][0].split("/");

            // Initialize the tree object with the first component (start from root hierarchy)
            let node = tree;
            //console.log(i);
            // Iterate through the components of the file path string
            for (let j = 0; j < components.length; j++) {
                if (j === components.length - 1) {
                    var fileData = { metadata: treePaths[i][1], blockData: treePaths[i][2] };
                    if (node[components[j]] === undefined) //no such key
                        node[components[j]] = { "/": [fileData] };
                    else if (node[components[j]]["/"] === undefined) //no file array folder
                        node[components[j]]["/"] = [fileData];
                    else
                        node[components[j]]["/"].push(fileData);
                }
                else if (node[components[j]] === undefined) {
                    node[components[j]] = {};
                }


                node = node[components[j]];
            }
        }
        return tree;
    }

    const reset = () => {
        paths = [];
        treePaths = [];
        pathDict.clear();
        readyCount = 0;
    }

    return (
        <ContextPath.Provider value={{
            findPathSuggestions,
            updateReady,
            getReady,
            getTreePathDict,
            addPath,
            reset,
        }}>
            {children}
        </ContextPath.Provider>
    );
}

