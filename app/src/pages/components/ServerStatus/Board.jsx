import { useEffect, useState } from "react";
import { Line } from "../general/Decorations";
import HTTPRequest from "../../../utils/HTTPRequest";
import React from "react";

const Board = () => {
    const [statusNFT, setStatusNFT] = useState('loading...');
    const rq1 = new HTTPRequest('https://api.nft.storage', 'GET');

    useEffect(()=>{ 
        console.log('loading status');
        rq1.getStatusCode().then(resp=>setStatusNFT(resp));
    },[]);

    return (
        <div className='px-2'>
            <h1>Status:</h1>
            <Line/>
            <h1>nft.storage: {statusNFT}</h1>
            <Line/>
        </div>
    );
}

export default Board;