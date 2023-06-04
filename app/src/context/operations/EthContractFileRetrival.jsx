import { contract_FileManagement as contract } from "../../utils/constants";
import Crypto from "../../utils/Crypto";
import DataUtils from "../../utils/DataUtils";


const crypto = new Crypto();
const dataUtils = new DataUtils();

const getIncomingEvents = async (account) => {
    try {
        const events = await contract.getIncomingFiles();
        //console.log(events);
        //console.log(requestBody);

        //decryption
        var decryptedCIDs = await crypto.decryptCIDs_(events, account, true);

        //replace encrypted contents to actual file properties
        var modEvents = dataUtils.makeMutableArray(events);
        for (var i = 0; i < events.length; i++) {
            //incoming events can be either someone to the user or the user to themselves
            if (events[i].extMetadataCID != '') {
                modEvents[i].extMetadataCID = decryptedCIDs[i];
                modEvents[i][3] = decryptedCIDs[i];
            }else {
                modEvents[i].intMetadataCID = decryptedCIDs[i];
                modEvents[i][4] = decryptedCIDs[i];
            }
        }

        console.log(modEvents);

        return modEvents;

    }catch(error) {
        console.log(error);
        alert(error.message);
    }
}

const getOutgoingEvents = async (account) => {
    try {

        const events = await contract.getOutgoingFiles();
        
        console.log(events);
        //decryption
        var decryptedCIDs = await crypto.decryptCIDs_(events, account, false);

        //replace encrypted contents to actual file properties
        var modEvents = dataUtils.makeMutableArray(events);
        for (var i = 0; i < events.length; i++) {
            //outgoing events must have internal and external use CID, decrypt internal use 
            modEvents[i].intMetadataCID = decryptedCIDs[i];
            modEvents[i][4] = decryptedCIDs[i];
        }

        console.log(modEvents);

        return modEvents;

    }catch(error) {
        console.log(error);
        alert(error.message);
    }
}

export {getIncomingEvents, getOutgoingEvents}