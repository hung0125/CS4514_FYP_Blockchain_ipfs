import { getPublicKey } from "../context/operations/EthContractCrypto";
import NodeRSA from 'jsencrypt';
import { FileStatus } from "./FileStatus";
class Crypto {

    constructor(){
        this.rsa = new NodeRSA();
    }

    // new implementations
    generateKeypair() {
        return new NodeRSA({ default_key_size: 2048 });
    }

    async encryptCID_(addressFrom, addressTo, rawMetaCID) {
        var publicKeyExt, publicKeyInt, encInternal, encExternal = '';
        
        publicKeyInt = await getPublicKey(addressFrom);
        publicKeyExt = addressFrom != addressTo ? await getPublicKey(addressTo) : undefined;

        if (!publicKeyInt)
            throw new Error('Public key is not set.');

        if (addressFrom != addressTo && !publicKeyExt)
            throw new Error("Recipient didn't set public key.");

        console.log('Int public key used: ', publicKeyInt);
        console.log('Ext public key used', publicKeyExt);
        
        this.rsa.setPublicKey(publicKeyInt);
        encInternal = this.rsa.encrypt(rawMetaCID).replace(/[\r\n]/gm, '');

        if (publicKeyExt) {
            this.rsa.setPublicKey(publicKeyExt);
            encExternal = this.rsa.encrypt(rawMetaCID).replace(/[\r\n]/gm, '');
        }

        console.log('Encrypted for internal:', encInternal);
        console.log('Encrypted for external:', encExternal);

        return {
            internal: encInternal,
            external: encExternal
        };
    }

    async decryptCIDs_(events, account, isIncoming) {
        const privateKey = localStorage.getItem('privatekey' + account);
        this.rsa.setPrivateKey(privateKey);

        var res = [];

        for (let i = 0; i < events.length; i++) {
            var int = events[i].intMetadataCID;
            var ext = events[i].extMetadataCID;
            var enc = isIncoming ? (ext ? ext : int) : int;
            var dec = events[i].fileControl.isPrivate && isIncoming ? ext : this.rsa.decrypt(enc);

            res.push(dec? dec : FileStatus.BROKENKEY);
        }

        return res;
    }
}

export default Crypto;