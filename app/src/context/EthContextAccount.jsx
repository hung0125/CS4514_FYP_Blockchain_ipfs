import React, {useEffect, useState} from "react";

export const EthContextAccount = React.createContext();

const {ethereum} = window;

export const EthAccountProvider = ({children}) => {
    //realtime update
    const [currentAccount, setCurrentAccount] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progressMsg, setProgressMsg] = useState('');

    //check wallet connection
    const checkConnected = async () => {
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


    useEffect(() => {
        checkConnected();
    }, []);

    return (
        <EthContextAccount.Provider value = {{
            connectWallet,
            setIsLoading,
            setProgressMsg, 
            currentAccount, 
            isLoading,
            progressMsg}}>
            {children}
        </EthContextAccount.Provider>
    );
}

