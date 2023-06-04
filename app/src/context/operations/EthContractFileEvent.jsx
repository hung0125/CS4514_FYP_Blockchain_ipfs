import { NFTStorage } from "nft.storage";
import { contract_FileManagement as contract, IPFSLocalAPI } from "../../utils/constants";
import { create } from "ipfs-http-client";
import TSFormatter from "../../utils/TSFormatter";
import Crypto from "../../utils/Crypto";

var client = null;
const crypto = new Crypto();
const tsf = new TSFormatter();

const shareFile = async (localPin, addressFrom, addressTo, fileobj, comment, path, progressSetter) => {
    var rootCID, metaCID;
    try {
        if (localPin) {
            //File upload
            client = create({ url: IPFSLocalAPI });
            var cids = [];

            progressSetter(`Uploading ${fileobj.length} file(s)...`);
            for await (const file of client.addAll(fileobj)) {
                cids.push(file.cid.toV1().toString());
            }
            console.log(cids);

            //File metadata preparation
            progressSetter('Preparing metadata...');
            const fileMetadata = {
                'comment': comment == '' ? 'N/A' : comment,
                'path': path == '' ? 'General' : path,
                'cidlist': [
                    {
                        'by_recipient' : false,
                        'update_comment': 'first version',
                        'update_timestamp': tsf.getDateTime(new Date().getTime()/1000),
                        'file': Array.from(fileobj).map((f, i) => ({
                            'cid': cids[i],
                            'name': f.name,
                            'size': (f.size / 1024).toFixed(2).toString() + ' KB',
                            'timestamp': Math.floor(f.lastModified / 1000)
                        }))
                    }
                ]
            };

            console.log(fileMetadata);

            progressSetter('Uploading metadata...');
            const {cid} = await client.add(JSON.stringify(fileMetadata));
            metaCID = cid.toV1().toString();
            console.log(metaCID);
        }else {
            client = new NFTStorage({ token: localStorage.getItem("nfttoken") });
            console.log(fileobj[0]);

            //File upload
            progressSetter(`Uploading ${fileobj.length} file(s)...`);
            rootCID = await client.storeDirectory(fileobj);
            console.log(rootCID);

            progressSetter('Preparing metadata...');
            //File metadata preparation
            const fileMetadata = {
                'comment': comment == '' ? 'N/A' : comment,
                'path': path == '' ? 'General' : path,
                'cidlist': [
                    {
                        'cid': rootCID,
                        'by_recipient': false,
                        'update_comment': 'first version',
                        'update_timestamp': tsf.getDateTime(new Date().getTime()/1000),
                        'file': Array.from(fileobj).map((f) => ({
                            'name': f.name,
                            'size': (f.size / 1024).toFixed(2).toString() + ' KB',
                            'timestamp': Math.floor(f.lastModified / 1000)
                        }))
                    }
                ]
            };

            console.log(fileMetadata);

            progressSetter('Uploading metadata...');
            metaCID = await client.storeBlob(new Blob([JSON.stringify(fileMetadata)]));
            console.log(metaCID);
        }
        

        //Encryption
        progressSetter('Encrypting metadata...');
        const encryptedMetadataCID = await crypto.encryptCID_(addressFrom, addressTo, metaCID);
        console.log(encryptedMetadataCID);

        progressSetter('Updating blockchain...');
        if ((addressFrom == addressTo && encryptedMetadataCID.internal) 
        || (addressFrom != addressTo && encryptedMetadataCID.internal && encryptedMetadataCID.external)) {
            var eventHash = await contract.shareFile(addressTo, encryptedMetadataCID.internal, encryptedMetadataCID.external, localPin);
            await eventHash.wait();
            alert(`Success - hash=${eventHash.hash}`);
        } else
            throw new error('Encryption error.');

    } catch (error) {
        console.error(error);
        // Only perform file unpin for nft.storage, local doesn't have library support
        if (!localPin) {
            if (rootCID)
                await client.delete(rootCID);
            if (metaCID)
                await client.delete(metaCID);
        }
        alert(error.message);
    }

    progressSetter('');
}

const updateVersion = async (byRecipient, localPin, addressFrom, addressTo, blockID, comment, mDataObj, fileInput, oldCID) => {
    var rootCID, metaCID;
    try {
        if (localPin) {
            client = create({ url: IPFSLocalAPI });
            var cids = [];
            for await (const file of client.addAll(fileInput)) {
                cids.push(file.cid.toV1().toString());
            }
            console.log(cids);
            
            mDataObj.cidlist.push({
                "by_recipient": byRecipient,
                "update_comment": comment,
                "update_timestamp": tsf.getDateTime(new Date().getTime()/1000),
                "file": Array.from(fileInput).map((f, i) => ({
                    'cid': cids[i],
                    'name': f.name,
                    'size': (f.size / 1024).toFixed(2).toString() + ' KB',
                    'timestamp': Math.floor(f.lastModified / 1000)
                }))
            });
            //modified metadata
            console.log(mDataObj);

            const {cid} = await client.add(JSON.stringify(mDataObj));
            metaCID = cid.toV1().toString();
            console.log(metaCID);
        }else {
            //prepare modified metadata
            client = new NFTStorage({ token: localStorage.getItem("nfttoken") });
            rootCID = await client.storeDirectory(fileInput)
            console.log(rootCID);

            mDataObj.cidlist.push({
                "cid": rootCID,
                "by_recipient": byRecipient,
                "update_comment": comment,
                "update_timestamp": tsf.getDateTime(new Date().getTime()/1000),
                "file": Array.from(fileInput).map((f) => ({
                    'name': f.name,
                    'size': (f.size / 1024).toFixed(2).toString() + ' KB',
                    'timestamp': Math.floor(f.lastModified / 1000)
                }))
            });

            console.log(mDataObj);

            //upload metadata
            metaCID = await client.storeBlob(new Blob([JSON.stringify(mDataObj)]));
            console.log(metaCID);
        }

        //encryption
        const encryptedMetadataCID = await crypto.encryptCID_(addressFrom, addressTo, metaCID);

        //blockchain and old data removal
        if ((addressFrom == addressTo && encryptedMetadataCID.internal) 
        || (addressFrom != addressTo && encryptedMetadataCID.internal && encryptedMetadataCID.external)) {
            var eventHash = await contract.updateMetadata(blockID, encryptedMetadataCID.internal, encryptedMetadataCID.external);
            await eventHash.wait();
            alert(`Success - hash=${eventHash.hash}`);
            if (!localPin)
                client.delete(oldCID);
        } else
            throw new error('Encryption error.');

        //return result
        return {
            newMdat: mDataObj,
            newMetaCID: metaCID
        };
    } catch (error) {
        console.log(error);
        if (!localPin) {
            if (rootCID)
                await client.delete(rootCID);
            if (metaCID)
                await client.delete(metaCID);
        }
        
        alert(error.message);
        return null;
    }
}

//soon be deprecated
const shareEvent = async (addressTo, cid, fileName, fileSize, lastModified, category, comment, chatRoomEnabled) => {
    try {
        var fileEventHash = await contract.uploadTransfer(
            addressTo,
            cid,
            fileName,
            fileSize,
            lastModified,
            category == '' ? 'General' : category,
            comment == '' ? 'N/A' : comment,
            chatRoomEnabled);

        console.log(`Loading - ${fileEventHash.hash}`);
        await fileEventHash.wait();
        alert(`Success - ${fileEventHash.hash}`);

    } catch (error) {
        console.log(error);
        alert(error.message);
        throw new Error("No ethereum object.");
    }
}

export { shareFile, updateVersion, shareEvent };