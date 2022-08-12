import React, {useEffect, useState} from "react";
import {ethers} from 'ethers';

import {contractABI, contractAddress} from '../utils/constants';

export const TransactionContext = React.createContext();

const {ethereum} = window;

const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);
    // console.log(
    //     provider,
    //     signer,
    //     transactionContract
    // ) 
    return transactionContract;
}

export const TransactionProvider = ({children}) => {
    //realtime update
    const [currentAccount, setCurrentAccount] = useState('');
    const [formData, setFormData] = useState({addressTo: '', amount: '', keyword: '', message: ''});
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));

    const handleChange = (e, name) => {
        setFormData((prevState) => ({...prevState, [name]: e.target.value}));
    }

    //check wallet connection
    const isWalletConnected = async () => {
        try{
            if (!ethereum) return alert("Please install metamask first.");

            const accounts = await ethereum.request({method: 'eth_accounts'});

            if(accounts.length) {
                setCurrentAccount(accounts[0]);
                console.log('wallet connected.');
            }else {
                console.log('No accounts found');
            }
        }catch(error){
            console.log(error);
            throw new Error("No ethereum object.");
        }
        
        
    }

    const connectWallet = async () => {
        try {
            if(!ethereum) return alert("Please install metamask first.");

            const accounts = await ethereum.request({method: 'eth_requestAccounts'});
            setCurrentAccount(accounts[0]);
        }catch(error){
            console.log(error);
            throw new Error("No ethereum object.");
        }
    }

    const sendTransaction = async () => {
        try {
            if(!ethereum) return alert("Please install metamask first.");

            //Get data from the form
            const {addressTo, amount, keyword, message} = formData;
            const transactionContract = getEthereumContract();
            const parsedAmount = ethers.utils.parseEther(amount);

            await ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: currentAccount, 
                    to: addressTo,
                    gas: '0x5208', //0.00021 eth,
                    value: parsedAmount._hex,
                }]
            });

            const transactionHash = await transactionContract.addToBlockchain(addressTo, parsedAmount, message, keyword);
            
            setIsLoading(true);
            console.log(`Loading - ${transactionHash.hash}`);
            await transactionHash.wait();
            setIsLoading(false);
            console.log(`Success - ${transactionHash.hash}`);

            const transactionCount = await transactionContract.getTransactionCount();
            
            setTransactionCount(transactionCount.toNumber());
            alert(`There are ${transactionCount} outgoing transactions in total.`);
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object.");
        }
    }

    const getTransactions = async () => {
        try {
            if(!ethereum) return alert("Please install metamask first.");

            const transactionContract = getEthereumContract();
            const transactions = await transactionContract.getAllTransactions();
            return transactions;

        }catch(error) {
            console.log(error);
            throw new Error("No ethereum object.");
        }
    }

    useEffect(() => {
        isWalletConnected();
    }, []);

    return (
        <TransactionContext.Provider value = {{connectWallet, currentAccount, formData, handleChange, sendTransaction, isLoading, getTransactions}}>
            {children}
        </TransactionContext.Provider>
    );
}