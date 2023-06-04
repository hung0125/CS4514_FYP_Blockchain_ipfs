import React, {useContext} from 'react';
import { useState } from 'react';
import { EthContextAccount } from '../../../context/EthContextAccount';
import strs from '../../../utils/strings.json'
import { FileForm } from '../general/Forms';

const commonStyles = 'min-h-[70px] sm:px-0 px-2 sm:min-w-[120px] flex justify-center items-center border-[0.5px] border-gray-400 text-white';

const FilePanel = () => {
    //https://ithelp.ithome.com.tw/articles/10241780
    //EthContext returns the methods to here, data can be shared
    //Win CMD (gen 10000 files): for /L %i in (1,1,10000) do echo %i > %i.html
    const {connectWallet, currentAccount} = useContext(EthContextAccount);

    //{a && b} <-- 'a' is false then won't exec/render 'b'
    return (
        <div className='flex w-full justify-center items-center bg-[#002B5B]'>
            <div className='flex md:flex-row flex-col items-start justify-between md:p-20 py-12 px-4'>
                <div className='flex flex-1 justify-start flex-col md:mr-10'>
                    <h1 className='text-3xl sm:text-5xl text-white py-1'>
                        {strs.Welcome_title1}<br/>{strs.Welcome_title2}
                    </h1>
                    
                    <p className='text-left mt-5 text-white font-light md:w-9/12 w-11/12 text-base'>
                        Key features:
                    </p>
                    <p className='text-white'>Reliable, Traceable</p>
                    <p className='text-white'>Immutable, Decentralized</p>
                    
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
                    
                </div>
                <div className='flex flex-col flex-1 items-center justify-start w-full md:mt-0 mt-10'>
                    <div className='p-5 sm:w-96 w-full flex flex-col justify-start items-center bg-[#256D85] rounded-md'>
                        {currentAccount && <h1 className='text-white text-base font-semibold'>Connected address: {currentAccount}</h1>}
                        {!currentAccount && <h1 className='text-white text-base font-semibold'>Login first</h1>}
                        
                        {currentAccount && <FileForm/>}
                    </div>
                </div>
            </div>
        </div>

        
    );
}

export default FilePanel;