import React, { useContext, useEffect, useState } from "react";
import Navbar from "./components/general/Navbar";
import Footer from "./components/general/Footer";
import Board from "./components/ServerStatus/board";
import { EthContractUT, CryptoUT } from "../context/operations/EthContractUT";
import { EthContextAccount } from "../context/EthContextAccount";
import { Line } from "./components/general/Decorations";
import TSFormatter from "../utils/TSFormatter";
import NodeRSA from 'jsencrypt';

const UTJoin = new EthContractUT();
const tsf = new TSFormatter();

const UnitTest = () => {
    const { currentAccount } = useContext(EthContextAccount);
    const [joinInbox, setJoinInbox] = useState([]);
    const [joinOutbox, setJoinOutbox] = useState([]);

    useEffect(() => {

        // const key = new NodeRSA({ b: 2048 });

        // console.log('public key', key.getPublicKey());
        // console.log('private key', key.getPrivateKey());

        // const text = "Hello SHIT!";
        // const encrypted = key.encrypt(text, "base64");
        // console.log("encrypted: ", encrypted);
        // const decrypted = key.decrypt(encrypted, "utf8");
        // console.log("decrypted: ", decrypted);

        UTJoin.test2('inbox').then( res => {
            setJoinInbox(res.slice(0).reverse());
        });

        UTJoin.test2('outbox').then( res => {
            setJoinOutbox(res.slice(0).reverse());
        });
    },[currentAccount]);
    return (
        <div className='bg-[#002B5B] text-white'>
            <Navbar/>
            <h1 className="p-2">Account: {currentAccount}</h1>
            <Line/>
            <div className="mx-2">
                <p>Join Inbox:</p>
                {joinInbox.map((record, i) => (
                    <div key={i}>
                        <p>
                            {i+1} - BlockID: {parseInt(record.blockID._hex, 16)};
                            JoinID: {parseInt(record.joinID._hex, 16)}; 
                            Datetime: {tsf.getDateTime(record.creationtime)};
                        </p>
                        <p>
                            Block owner: {record.blockOwner};
                            Joiner: {record.joiner};
                        </p>
                        <p>
                            Decision: {(() => {
                                switch(record.status) {
                                    case 0:
                                        return record.decisiontime > 0 ? 'Accepted' : '/';
                                    case 1:
                                        return 'Rejected';
                                    case 2:
                                        return 'Cancelled';
                                    default:
                                        return '';
                            }})()};
                            Decision made at: {record.decisiontime > 0? tsf.getDateTime(record.decisiontime) : '/'}
                        </p>
                    </div>
                ))}
            </div>
            
            <div className="mx-2 my-3">
                <p>Join outbox:</p>
                {joinOutbox.map((record, i) => (
                    <div key={i}>
                        <p>
                            {i+1} - BlockID: {parseInt(record.blockID._hex, 16)}; 
                            JoinID: {parseInt(record.joinID._hex, 16)}; 
                            Created at: {tsf.getDateTime(record.creationtime)};
                        </p>
                        <p>
                            Block owner: {record.blockOwner};
                            Joiner: {record.joiner};
                        </p>
                        <p>
                            Decision: {(() => {
                                switch(record.status) {
                                    case 0 && parseInt(record.decisiontime, 16) > 0:
                                        return record.decisiontime > 0 ? 'Accepted' : '/';
                                    case 1:
                                        return 'Rejected';
                                    case 2:
                                        return 'Cancelled';
                                    default:
                                        return '';
                            }})()};
                            Decision made at: {record.decisiontime > 0? tsf.getDateTime(record.decisiontime) : '/'}
                        </p>
                    </div>
                ))}
            </div>
        
            <Line/>
            <Board/>
            <div className="mx-1">
                Smart Contract: {UTJoin.getTests().map((v, i) => (
                    <button key={i} className="p-1" onClick={v}>Test {i+1}</button>
                ))}
            </div>
            <div className="mx-1">
                Encryption: {new CryptoUT().getTests().map((v, i) => (
                    <button key={i} className="p-1" onClick={v}>Test {i+1}</button>
                ))}
            </div>
            <Footer/>
        </div>
    );
};

export default UnitTest;