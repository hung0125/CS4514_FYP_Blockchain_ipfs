import React, {useContext} from 'react';
import { TransactionContext } from '../context/TransactionContext';
import { Loader } from './';

const commonStyles = 'min-h-[70px] sm:px-0 px-2 sm:min-w-[120px] flex justify-center items-center border-[0.5px] border-gray-400 text-white';

const Input = ({placeholder, name, type, value, handleChange}) => (
    <input
        placeholder={placeholder}
        type={type}
        step="0.0001"
        value={value}
        onChange={(e) => handleChange(e, name)}
        className='my-2 w-full rounded-sm p-2 outline-none'
    />
);

const Welcome = () => {
    //https://ithelp.ithome.com.tw/articles/10241780
    //TransactionContext returns the methods to here, data can be shared
    const {connectWallet, currentAccount, formData, handleChange, sendTransaction, isLoading} = useContext(TransactionContext); 

    const handleSubmit = (e) => {
        const {addressTo, amount, keyword, message} = formData;

        e.preventDefault();

        if(!addressTo || !amount || !keyword || !message) return;

        sendTransaction();
    }
    
    //{a && b} <-- 'a' is false then won't exec 'b'
    return (
        <div className='flex w-full justify-center items-center bg-green-600'>
            <div className='flex md:flex-row flex-col items-start justify-between md:p-20 py-12 px-4'>
                <div className='flex flex-1 justify-start flex-col md:mr-10'>
                    <h1 className='text-3xl sm:text-5xl text-white py-1'>
                        Send some shits <br/> across the universe
                    </h1>
                    <p className='text-left mt-5 text-white font-light md:w-9/12 w-11/12 text-base'>
                        Explore the shit world. Buy and sell shits on here.
                    </p>
                    
                    {!currentAccount && (<button
                        type='button'
                        onClick={connectWallet}
                        className='flex flex-row justify-center items-center my-5 bg-[#2952e3] p-3 rounded-full cursor-pointer hover:bg-[#2546bd]'
                    >
                        <p className='text-white text-base font-semibold'>Connect Wallet</p>
                    </button>)}

                    {/* <div className='grid sm:grid-cols-3 grid-cols-2 w-full mt-10'>
                        <div className={`rounded-tl-2xl ${commonStyles}`}>
                            Reliability
                        </div>
                        <div className={commonStyles}>
                            Security
                        </div>
                        <div className={`rounded-tr-2xl ${commonStyles}`}>
                            Convenience
                        </div>
                    </div> */} 

                    <p className='text-white'>Reliable, Convenience</p>
                    <p className='text-white'>Anonymous, Decentralized</p>
                </div>
                <div className='flex flex-col flex-1 items-center justify-start w-full md:mt-0 mt-10'>
                    <div className='p-5 sm:w-96 w-full flex flex-col justify-start items-center bg-slate-800 rounded-md'>
                        {currentAccount && <h1 className='text-white text-base font-semibold'>Connected address: {currentAccount}</h1>}
                        <Input placeholder="Address To" name="addressTo" type="text" handleChange={handleChange}/>
                        <Input placeholder="Amount (ETH)" name="amount" type="number" handleChange={handleChange}/>
                        <Input placeholder="Shit String" name="keyword" type="text" handleChange={handleChange}/>
                        <Input placeholder="More shit " name="message" type="text" handleChange={handleChange}/>
                        
                        <div className='h-[1px] w-full bg-gray-400 my-2'/>

                        {currentAccount && isLoading? (
                            <Loader/>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className="text-white w-full mt-2 border-[1px] p-2 border-[#3d4f7c] rounded-full cursor-pointer">
                            Share  
                            </button>
                        )} 
                    </div>
                </div>
            </div>
        </div>

        
    );
}

export default Welcome;