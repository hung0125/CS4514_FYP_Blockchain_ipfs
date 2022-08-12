import React, {useContext, useState} from 'react';
import { useEffect } from 'react';
import { TransactionContext } from '../context/TransactionContext';

const getDateTime = (UNIX_timestamp) => {
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours() < 10? '0' + a.getHours():a.getHours();
    var min = a.getMinutes() < 10? '0' + a.getMinutes():a.getMinutes();
    var sec = a.getSeconds() < 10? '0' + a.getSeconds():a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
}

/*
[
    "0x4a4Ffc5B1ef55c4822D716d29C3966e63DEd21BA",
    "0xD8Ea779b8FFC1096CA422D40588C4c0641709890",
    {
        "type": "BigNumber",
        "hex": "0x0110d9316ec000"
    },
    "message 1",
    {
        "type": "BigNumber",
        "hex": "0x62f5fea8"
    },
    "message 2"
]
*/
const InfoCard = ({dataArr}) => (
    <div className='p-5 my-2 w-full rounded-sm outline-none bg-slate-800'>
        Time: {getDateTime(parseInt(dataArr[4]._hex, 16))}<br/>
        From: {dataArr[0]}<br/>
        To: {dataArr[1]}<br/>
        IPFS Hash: {dataArr[5]}<br/>
        More data: {dataArr[3]}

    </div>
);


const Transactions = () => {
    const {currentAccount, getTransactions} = useContext(TransactionContext); 
    const [transactions, setTransactions] = useState([])

    const fetchData = () => {
        getTransactions().then(dat => {
            setTransactions(dat);
        })
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <div className='w-full bg-green-600 text-white'>
            <div className='flex mx-2'>
                <h1 className='text-3xl'>Files</h1>
                <button onClick={fetchData} className='bg-[#2952e3] py-2 px-7 mx-4 rounded-full cursor-pointer hover:bg-[#2546bd]'>
                    Refresh
                </button>
            </div>
            {currentAccount && ( 
                transactions.slice(0).reverse().map((dataArr) => (
                    <InfoCard dataArr={dataArr} key={dataArr}/>
                )))}

        </div>
    );

    
}



export default Transactions;

