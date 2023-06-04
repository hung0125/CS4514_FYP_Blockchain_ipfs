import Crypto from "../../utils/Crypto";
import { contract_FileManagement as contract } from "../../utils/constants";

const accounts = ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
            '0xbda5747bfd65f08deb54cb465eb87d40e51b197e',
            '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'];
const crypto = new Crypto();

class EthContractUT {

    async test1() {
        /* Portions:
        [pass] 1. Happy flow
        [pass] 2. require(eventMap[_blockID].blockID > 0, "The block does not exist.");
        [pass] 3. require(msg.sender != eventMap[_blockID].sender, "You can't request to join the block you owned.");
        [pass] 4. require(msg.sender != eventMap[_blockID].recipient, "Already joined the block.");
        [pass] 5. require(!userList[msg.sender].resolvedJoinRequests[_blockID], "The request is pending approval.");
        */ 
        try {
            await contract.requestJoinBlock(2);
        }catch(error) {
            alert(error);
        }
    }

    async test2(direction) {
        /* Portions:
        [pass] 1. Happy flow (non-empty)
        [pass] 2. Happy flow (empty)
        */

        try {
            if (direction == 'inbox') { 
                const res = await contract.getJoinInbox()
                console.log(res);
                return res;
            }else if (direction == 'outbox') {
                const res = await contract.getJoinOutbox()
                console.log(res);
                return res;
            }
        }catch(error) {
            alert(error);
        }
    }

    async test3(approve, intMetadataCID) {
        /**
         * Portions:
         * [pass] 1. Accept a request (happy flow)
         * [pass] 2. Reject a request (happy flow)
         * [pass] 3. require(joinMap[_joinID].decisiontime == 0, 'The request is already processed.');
         * [pass] 4. require(msg.sender == eventMap[joinMap[_joinID].blockID].sender, "Unauthorized.");
         * [pass] 5. Invalid joinID
         */

        approve = true;
        intMetadataCID = 'bafybeicg6smgtnov7xc5p2sp7y7v4okzpcm5rpzkfhkx34ri4mclwjleju';
        try {
            var encryptedCID;
            if (approve) {
                encryptedCID = await crypto.encryptCID_(accounts[1], accounts[2], intMetadataCID);
            }
            await contract.evaluateJoinInbox(2, approve, encryptedCID.external);
        }catch(error) {
            alert(error);
        }
        
    }

    async test4() {
        /**
         * Portions:
         * [pass] 1. Cancel a request (happy flow)
         * [pass] 2. require(joinMap[_joinID].decisiontime == 0, 'The request is already processed.');
         * [pass] 3. require(msg.sender != joinMap[_joinID].joiner, "Unauthorized.");
         */
        try {
            await contract.cancelJoin(1);
        }catch(error) {
            alert(error);
        }
    }

    async test5() {
        /**
         * [pass] 1. update any key 
         */
        try {
            await contract.updatePublicKey("Lorem ipsum key");
            alert('Completed transaction.')
        }catch(error) {
            alert(error);
        }
    }

    async test6() {
        /**
         * [pass] 1. get public key from self 
         * [pass] 2. get public key from others
         */
        try {
            const res = await contract.getPublicKey('0xbda5747bfd65f08deb54cb465eb87d40e51b197e');
            console.log(res);
        }catch(error) {
            alert(error);
        }
    }

    async test7() {
        /**
         * [pass] 1. get incoming files
         */
        try {
            const res = await contract.getIncomingFiles();
            console.log(res);
        }catch(error) {
            alert(error);
        }
    }

    async test8() {
        /**
         * [pass] 1. get outgoing files
         */

        try {
            const res = await contract.getOutgoingFiles();
            console.log(res);
        }catch(error) {
            alert(error);
        }
    }

    async test9() {
        /**
         * [pass] 1. update metadata as the owner.
         */
        try {
            const trans = await contract.shareFile('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'test case shared metadata', '', false);
            await trans.wait();
            const files = await contract.getIncomingFiles();
            console.log("Before", files);

            const trans2 = await contract.updateMetadata(parseInt(files[files.length - 1].blockID, 16), 'test case shared updated metadata' , '')
            await trans2.wait();
            const files2 = await contract.getIncomingFiles();
            console.log("After", files2);
        }catch(error) {
            alert(error);
        }
    }

    async test10() {
        try {
            await contract.updateMetadata(10, 'test case shared updated metadata', '');
        }catch(error) {
            alert(error);
        }
    }

    

    getTests() {
        return [this.test1, this.test2, this.test3, this.test4, this.test5, this.test6, this.test7, this.test8, this.test9, this.test10];
    }
}

class CryptoUT {
    test1() {
        // [pass] 1. Generate a 2048 key pair
        const rsaObj = crypto.generateKeypair();
        console.log('Bit-length:', rsaObj.getKey().n.bitLength());
        console.log('Public key:', rsaObj.getPublicKey());
        console.log('Private key:', rsaObj.getPrivateKey());
    }
    
    test2() {
        // [pass] 1. Encrypt with same addressFrom, addressTo
        console.log("Test 1", crypto.encryptCID_('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', 'bafyabcdefghijklmnopqrstuvwxyz'));
        // [pass] 2. Encrypt with different addressFrom, addressTo 
        console.log("Test 2", crypto.encryptCID_('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', '0xbda5747bfd65f08deb54cb465eb87d40e51b197e', 'bafyabcdefghijklmnopqrstuvwxyz'));
        // [pass] 3. Encrypt with invalid addressFrom
        console.log("Test 3", crypto.encryptCID_('abc', '0xbda5747bfd65f08deb54cb465eb87d40e51b197e', 'bafyabcdefghijklmnopqrstuvwxyz'));
        // [pass] 4. Encrypt with invalid addressTo
        console.log("Test 4", crypto.encryptCID_('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', 'abc', 'bafyabcdefghijklmnopqrstuvwxyz'));
        
    }

    async test3() {
        // [pass] 1. decrypt incoming
        const inev = await contract.getIncomingFiles();
        console.log("Incoming: ", crypto.decryptCIDs_(inev, '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', true));
    }

    async test4() {
        // [pass] 1. decrypt outgoing
        const outev = await contract.getOutgoingFiles();
        console.log("Outgoing: ", crypto.decryptCIDs_(outev, '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', false));
    }

    getTests() {
        return [this.test1, this.test2, this.test3, this.test4];
    }
}



export {EthContractUT, CryptoUT};





