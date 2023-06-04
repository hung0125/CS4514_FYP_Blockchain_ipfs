import Crypto from "../../utils/Crypto";
import { contract_FileManagement as contract } from "../../utils/constants";

const crypto = new Crypto();

class EthContractJoinRequest {

    async requestJoinBlock(id) {
        try {
            await contract.requestJoinBlock(id);
            alert(`Requested to join block ${id}`);
        }catch(error) {
            alert(error.message);
        }
    }

    async getJoin() {
        /* Portions:
        [pass] 1. Happy flow (non-empty)
        [pass] 2. Happy flow (empty)
        */
        var res = {inbox: [], outbox: []}

        try {
                const resIn = await contract.getJoinInbox()
                console.log('Incoming reqeusts');
                console.log(resIn);
                res.inbox = resIn;
                

                const resOut = await contract.getJoinOutbox()
                console.log('Outgoing reqeusts');
                console.log(resOut);
                res.outbox = resOut;

                return res;
        }catch(error) {
            alert(error);
        }

        return res;
    }

    async evaluateJoinInbox(joinID, currentAccount, joiner, approve, intMetadataCID) {
        // approve = true;
        // intMetadataCID = 'bafybeicg6smgtnov7xc5p2sp7y7v4okzpcm5rpzkfhkx34ri4mclwjleju';
        try {
            var encryptedCID = {external: ''};
            if (approve) {
                encryptedCID = await crypto.encryptCID_(currentAccount, joiner, intMetadataCID);
            }
            await contract.evaluateJoinInbox(joinID, approve, encryptedCID.external);
            alert(`${approve? 'Approved': 'Rejected'} the join request #${joinID}.\n[For Approval] Check the "Sent Files" tab when the transaction is confirmed.`);
        }catch(error) {
            console.error(error);
            alert(error.message);
        }
        
    }

    async cancelJoin(joinID) {
        try {
            await contract.cancelJoin(joinID);
            alert(`Cancelled the join request #${joinID}`);
        }catch(error) {
            alert(error.message);
        }
    }
}


export default EthContractJoinRequest;