import Window from "floating-window-ui";
import { useState, useEffect, useContext } from "react";
import { updatePublicKey, getPublicKey } from "../../../context/operations/EthContractCrypto";
import { EthContextAccount } from "../../../context/EthContextAccount";
import Crypto from "../../../utils/Crypto";

const crypto = new Crypto();

const utf8ArrayToStr = (array) => {
    var out, i, len, c;
    var char2, char3;

    out = "";
    len = array.length;
    i = 0;
    while(i < len) {
        c = array[i++];
        switch(c >> 4)
        { 
        case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
            out += String.fromCharCode(c);
            break;
        case 12: case 13:
            char2 = array[i++];
            out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
            break;
        case 14:
            char2 = array[i++];
            char3 = array[i++];
            out += String.fromCharCode(((c & 0x0F) << 12) | ((char2 & 0x3F) << 6) | ((char3 & 0x3F) << 0));
            break;
        }
    }

    return out;
}

const retrieveNFTToken = () => {
    const key = localStorage.getItem("nfttoken");
    if (key)
        return key;
    else
        return '';
}

const getPrivateKey = (curAccount) => {
    const key = localStorage.getItem("privatekey" + curAccount);
    if (key)
        return key;
    else
        return 'NOT SET';
}

const WindowSettings = (parent) => {
    const {currentAccount} = useContext(EthContextAccount);
    const [nfttoken, setNfttoken] = useState(retrieveNFTToken());
    const [pubKey, setPubKey] = useState('NOT SET');
    const [prvKey, setPrvKey] = useState(getPrivateKey(currentAccount));

    const saveToken = () => {
        const token = document.getElementById('nfttoken').value;
        localStorage.setItem("nfttoken", token);
        console.log(localStorage.getItem("nfttoken"));
        alert('Saved.');
    }

    const renewKey = () => {
        // fetch(cryptoAPI_keypair, { method: "GET" }).then(
        //     (resp) => {
        //         resp.text().then((str) => {
        //             const retPubkey = utf8ArrayToStr(base64.decode(JSON.parse(str).pubkey));
        //             const retPrvkey = utf8ArrayToStr(base64.decode(JSON.parse(str).prvkey));
        //             updatePublicKey(retPubkey).then(confirm => {
        //                 if (confirm) {
        //                     setPubKey(retPubkey);
        //                     setPrvKey(retPrvkey);
        //                     localStorage.setItem("privatekey" + currentAccount, retPrvkey);
        //                     alert("Renewed and saved");
        //                 }else
        //                     alert("Cancelled renewal");
        //             });
 
        //         });
        //     }
        // );

        const keypair = crypto.generateKeypair();

        const retPubkey = keypair.getPublicKey();
        const retPrvkey = keypair.getPrivateKey();
        updatePublicKey(retPubkey).then(confirm => {
            if (confirm) {
                setPubKey(retPubkey);
                setPrvKey(retPrvkey);
                localStorage.setItem("privatekey" + currentAccount, retPrvkey);
                alert("Renewed and saved");
            }else
                alert("Cancelled renewal");
        });
    }

    const saveKey = () => {
        updatePublicKey(pubKey).then(confirm => {
            if (confirm) {
                localStorage.setItem("privatekey" + currentAccount, prvKey);
                alert("Saved");
            }else 
                alert("Cancelled");
        });
    }

    useEffect(()=>{
        setNfttoken(retrieveNFTToken());
        getPublicKey(currentAccount).then(res=>(setPubKey(res)));
    }, []);

    return (
        <div>
            <Window
                id="Window Settings"
                height={window.innerHeight * 0.8}
                width={window.innerWidth * 0.8}
                resizable={true}
                titleBar={{
                    icon: "🛠",
                    title: "Settings",
                    buttons: {close: ()=>parent.windowCloseSettings()},
                }}>
                
                <div className='bg-gray-300 h-screen'>
                    <h1 className='mx-2'>Current settings: </h1>
                    <span className='mx-2'>- <a href="https://nft.storage" target="_blank" className="text-blue-700">NFT.Storage</a> API Token: </span>
                    <input type='text' id='nfttoken' value={nfttoken} onChange={event => setNfttoken(event.target.value)}/>
                    <button id='saveToken' className='mx-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' onClick={saveToken}>Save</button>
                    <br/><br/><span className='mx-2'>- Data protection: </span>
                    <br/><span className='mx-2'>Public key: </span><input type='text' id='pubkey' className="m-1" value={pubKey} onChange={event => setPubKey(event.target.value)}/>
                    <br/><span className='mx-2'>Private key: </span><input type='text' id='prvkey' className="m-1" value={prvKey} onChange={event => setPrvKey(event.target.value)}/>
                    <br/><span className='mx-2'>Please keep the above key pair properly. Old data will become UNREADABLE if key pair is changed.</span>
                    <br/><span className='mx-2'>There will be a few seconds delay for the public key renewal. DO NOT perform any transaction immediately.</span>
                    <br/><button id='newKeys' className='mx-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' onClick={renewKey}>Renew Key Pair</button>
                    <button id='saveKeys' className='mx-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' onClick={saveKey}>Save</button>
                </div>
            </Window>
        </div>
    );
}

export default WindowSettings;