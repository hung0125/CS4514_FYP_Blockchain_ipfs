import { contract_FileManagement as contract } from "../../utils/constants";
import { NFTStorage } from "nft.storage";

const setPrivate = async(bool, blockID) => {
    try {
        const process = await contract.setPrivate(bool, blockID);
        await process.wait();
        return true;
    }catch(error) {
        console.log(error);
        alert(error.message);
    }
}

const setExpired = async(blockID, metaCID, fileCIDs) => {
    var chainUpdateSuccess = false;
    try {
        const process = await contract.setExpired(blockID);
        await process.wait();
        alert('Success');
        chainUpdateSuccess = true;
    }catch(error) {
        console.log(error.message);
        alert(error.message);
    }
    if (chainUpdateSuccess) {
        try {
            const client = new NFTStorage({ token: localStorage.getItem("nfttoken") });
            try {
                //NFT.Storage Removal
                client.delete(metaCID);
            }catch(error) {
                console.log(error);
            }
    
            try {
                //NFT.Storage Removal
                const client = new NFTStorage({ token: localStorage.getItem("nfttoken") });
                for (var i = 0; i < fileCIDs.length; i++)
                    client.delete(fileCIDs[i]);
            }catch(error) {
                console.log(error);
            }
        }catch(error) {
            alert(error.message)
        }
    }
    return chainUpdateSuccess;
}

const setPermitRecipientUpdate = async(bool, blockID) => {
    try {
        const process = await contract.setPermitRecipientUpdate(bool, blockID);
        await process.wait();
        return true;
    }catch(error) {
        console.log(error.message);
        alert(error.message);
        return false;
    }
}

export {setPrivate, setExpired, setPermitRecipientUpdate};