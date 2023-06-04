class RecordUtils {

    constructor() {}

    getAddressList(tabVal, fileEvents) {
        if (tabVal !== 'Incoming' && tabVal !== 'Outgoing')
            return alert('DataUtils: Wrong tabVal');
        var arr = [];
        var map = new Map();
        
        for (let i = 0; i < fileEvents.length; i++) {
            const val = tabVal == 'Incoming'? fileEvents[i].sender : fileEvents[i].recipient;

            if (!map.has(val)) {
                map.set(val, true)
                arr.push(val);
            }   
        }
        
        map.clear();
        return arr;
    }

    metadataHasFileName(cidlist, name) {
        for (let i = 0; i < cidlist?.length; i++) {
            for (let j = 0; j < cidlist[i].file.length; j++) {
                if (cidlist[i].file[j].name.toLowerCase().includes(name.toLowerCase()))
                    return true;
            }
        }

        return false;
    }

    metadataHasUpdateComment(cidlist, comment) {
        for (let i = 0; i < cidlist?.length; i++) {
            if(cidlist[i].update_comment.toLowerCase().includes(comment.toLowerCase()))
                return true;
        }

        return false;
    }

    // metadataFileSize(cidlist) {
    //     if (!cidlist) return 0;
        
    //     var size = 0;

    //     for (let i = 0; i < cidlist.length; i++) {
    //         for (let j = 0; j < cidlist[i].file.length; j++) {
    //             size += parseFloat(cidlist[i].file[j].size);
    //         }
    //     }
        
    //     return size;
    // }

    getValidRecordsIndices(fileEvents, 
        metadata,
        typeOfPinning, 
        addrFrom, 
        addrTo, 
        block_ID, 
        has_file_name, 
        has_comment, 
        has_update_comment, 
        date_from,
        date_to) {
        
        console.log(fileEvents);
        console.log(metadata);

        var res = {};

        for (let i = 0; i < fileEvents.length; i++) {
            const ev = fileEvents[i];
            const evblkID = parseInt(ev.blockID, 16);
            const evdat = parseInt(ev.timestamp._hex, 16);
            const pinType = ev.localPin? 'Local' : 'Remote';

            // checking is ordered by worst case time complexity
            if ((typeOfPinning === 'All' || typeOfPinning === pinType) 
            && (block_ID === '' || evblkID == block_ID)
            && (addrFrom ==='All' || !addrFrom || addrFrom === ev.sender)
            && (addrTo === 'All' || !addrTo || addrTo === ev.recipient)
            && (has_comment === '' || metadata[evblkID].comment.toLowerCase().includes(has_comment.toLowerCase()))
            && (date_from === '' || evdat >= date_from)
            && (date_to === '' || evdat <= date_to + 86399)
            && (has_update_comment === '' || this.metadataHasUpdateComment(metadata[evblkID]?.cidlist, has_update_comment))
            && (has_file_name === '' || this.metadataHasFileName(metadata[evblkID]?.cidlist, has_file_name)))
                res[evblkID] = true;
        }

        return res;
    }

    // getSorted(fileEvents, metadata, sortType, sortOrder) {
    //     var ord_asc = sortOrder === 'asc'? true : false;

    //     switch(sortType) {
    //         case 'blockid':
    //             return fileEvents.sort((a, b) => ord_asc? parseInt(a.blockID, 16) - parseInt(b.blockID, 16) : parseInt(b.blockID, 16) - parseInt(a.blockID, 16));
    //         case 'pintype':
    //             return fileEvents.sort((a, b) => ord_asc? b.localPin - a.localPin : a.localPin - b.localPin);
    //         case 'filesize':
    //             return fileEvents.sort((a, b) => ord_asc? 
    //                 this.metadataFileSize(metadata[parseInt(b.blockID, 16)]?.cidlist) - this.metadataFileSize(metadata[parseInt(a.blockID, 16)]?.cidlist) : 
    //                 this.metadataFileSize(metadata[parseInt(a.blockID, 16)]?.cidlist) - this.metadataFileSize(metadata[parseInt(b.blockID, 16)]?.cidlist));
    //         default:
    //             return fileEvents;
    //     }
    // }
}

export default RecordUtils;