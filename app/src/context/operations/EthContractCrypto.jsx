import { contract_FileManagement as contract } from "../../utils/constants";

const updatePublicKey = async(publicKey) => {
    try {
        await contract.updatePublicKey(publicKey);
        return true;
    }catch(error){
        console.log(error);
        alert(error.message);
        return false;
    }
}

const getPublicKey = async(address) => {
    try {
        const key = await contract.getPublicKey(address);
        return key;
    }catch(error){
        console.log(error);
        throw new Error("Couldn't retrieve public key.");
    }
}

export {updatePublicKey, getPublicKey};