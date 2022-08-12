import React, {useContext} from 'react';
import { TransactionContext } from '../context/TransactionContext';

const Services = () => {
    const {getTransactions} = useContext(TransactionContext); 

    const btn_getTransactions = () => {
        console.log(getTransactions());
    }

    return (
        <button
            type="button"
            onClick={btn_getTransactions}
            className="text-white w-full mt-2 border-[1px] p-2 border-[#3d4f7c] rounded-full cursor-pointer bg-slate-600">
        Get Transactions  
        </button>
    );
}

export default Services;