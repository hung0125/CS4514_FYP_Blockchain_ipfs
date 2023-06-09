import { useState, useEffect, useContext } from 'react';
import { EthContextAccount } from '../../../../context/EthContextAccount';
import { ContextPath, PathProvider } from '../../../../context/ContextPath';
import { setPrivate, setExpired } from '../../../../context/operations/EthContractFileProps';
import TSFormatter from '../../../../utils/TSFormatter';
import HTTPRequest from '../../../../utils/HTTPRequest';
import { FileStatus } from '../../../../utils/FileStatus';
import PopVersionControl from './PopVersionControl';
import BatchDownloader from '../../../../utils/BatchDownloader';
import PopUserPermission from './PopUserPermission';
import { ContextSharedData } from '../../../../context/ContextSharedData';
import { Button } from '@mui/material';
import EthContractJoinRequest from '../../../../context/operations/EthContractJoinRequest';

const tsf = new TSFormatter();
const downloader = new BatchDownloader();
const contract = new EthContractJoinRequest(); 

const InfoCardFile = (data) => {
    //const {setPrivate, setExpired, isPrivate} = useContext(EthContext);
    const { currentAccount } = useContext(EthContextAccount);
    const { dictSet } = useContext(ContextSharedData);
    const { addPath, updateReady } = useContext(ContextPath);
    const [announcedReady, setAnnouncedReady] = useState(false);
    const [metadata, setMetadata] = useState('Loading...');
    const [vcPopupEnabled, setVcPopupEnabled] = useState(false);
    const [permPopupEnabled, setPermPopupEnabled] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(null);

    var scrollY = window.scrollY;
    // console.log(data);

    window.onscroll = () => {
        if (vcPopupEnabled || permPopupEnabled)
            window.scrollTo(0, scrollY);
    };

    const checkAvail = () => {
        if (metadata == FileStatus.EXPIRED)
            return 'Already deleted.';
        if (metadata == FileStatus.PRIVATE)
            return 'No permission.';
        else
            return null;
    }

    const confirmExpire = () => {
        if (checkAvail())
            return alert(checkAvail());
        const conf = confirm('Are you sure to expire this transfer?');
        if (conf) {
            var cids = [];
            for (var i = 0; i < metadata.cidlist.length; i++)
                cids.push(metadata.cidlist[i].cid);

            setExpired(data.v.blockID,
                data.v.extMetadataCID ? data.v.extMetadataCID : data.v.intMetadataCID, 
                cids).then(success => {
                    if (success)
                        data.fetchData()
                });
        } else
            alert('cancelled')
    }

    const downloadAll = () => {
        if (checkAvail())
            return alert(checkAvail());

        var urls = [];
        var names = [];
        console.log(urls);
        console.log(names);
        metadata.cidlist[metadata.cidlist.length - 1].file.forEach(f => {
            urls.push(data.v.localPin ?
                `http://${f.cid}.ipfs.localhost:8080` : `https://${metadata.cidlist[0].cid}.ipfs.nftstorage.link/${f.name}`);
            names.push(f.name);
        });
        setDownloadProgress('...');
        downloader.download(urls, names, setDownloadProgress);
    }

    const actionTriggered = (e) => {
        const option = e.target.value;
        e.target.value = 'default';
        switch (option) {
            case 'delete':
                confirmExpire();
                break;
            case 'version':
                setVcPopupEnabled(true);
                scrollY = window.scrollY;
                break;
            case 'download':
                downloadAll();
                break;
            case 'permission':
                setPermPopupEnabled(true); 
                scrollY = window.scrollY;
                break;
        }
    }

    useEffect(() => {
        //Metadata analysis and conversion
        if (data.v.fileControl.isExpired) 
            setMetadata(FileStatus.EXPIRED);
        else if (data.v.extMetadataCID == FileStatus.PRIVATE)
            setMetadata(FileStatus.PRIVATE);
        else if (data.v.extMetadataCID == FileStatus.BROKENKEY || data.v.intMetadataCID == FileStatus.BROKENKEY)
            setMetadata('broken decryption key');
        else {
            var request;
            if (data.metadata) {
                setMetadata(data.metadata);
            }else if (data.v.localPin)
                request = new HTTPRequest(`http://${data.type == 'Incoming' && data.v.extMetadataCID ? data.v.extMetadataCID : data.v.intMetadataCID}.ipfs.localhost:8080`, 'GET');
            else
                request = new HTTPRequest(`https://${data.type == 'Incoming' && data.v.extMetadataCID ? data.v.extMetadataCID : data.v.intMetadataCID}.ipfs.nftstorage.link`, 'GET');

            if (request) {
                request.sendAwait().then(reply => {
                    try {
                        var jObj = JSON.parse(reply);
                        console.log(jObj);
                        setMetadata(jObj);
                        dictSet('metadata', parseInt(data.v.blockID._hex, 16) ,jObj);
                        addPath(jObj, data.v);
                    } catch (error) {
                        console.error(error);
                        setMetadata('Data Error');
                    }

                });
            }
        }
    }, []);

    useEffect(() => {
        if (vcPopupEnabled || permPopupEnabled)
            document.getElementById('fileManagementBody').style.filter = 'brightness(50%)';
        else
            document.getElementById('fileManagementBody').style.filter = 'brightness(100%)';
    }, [vcPopupEnabled, permPopupEnabled]);

    useEffect(() => {
        if (metadata != 'Loading...' && !announcedReady) {
            updateReady();
            setAnnouncedReady(true);
        }
    }, [metadata]);

    //data.type == 'Incoming'
    return (
        <div className='normal-case p-5 mt-2 w-full rounded-sm outline-none bg-[#256D85] font-mono break-all'>
            {(vcPopupEnabled) &&
                <PopVersionControl
                    metadataCID={data.type == 'Incoming' && data.v.extMetadataCID ? data.v.extMetadataCID : data.v.intMetadataCID}
                    metadata={metadata}
                    setMetadata={setMetadata}
                    blockData={data.v}
                    onClose={() => setVcPopupEnabled(false)} />}
            {(permPopupEnabled) &&
                <PopUserPermission
                    fileControl={data.v.fileControl}
                    blockID={data.v.blockID}
                    fetchData={data.fetchData}
                    onClose={() => setPermPopupEnabled(false)} />}

            {typeof metadata === 'string' && <div><h1 className='text-red-400 font-bold'>{metadata}</h1></div>}
            
            <table className='border-collapse border border-slate-400'>
                <tbody>
                    <tr>
                        <td className='font-semibold border border-slate-300 break-normal'>Type of Pinning</td>
                        <td className='border border-slate-300 px-2'>{data.v.localPin? 'Local Node' : 'NFT.Storage (Remote)'}</td>
                        <td className='font-semibold border border-slate-300 break-normal'>Block ID </td>
                        <td className='border border-slate-300 px-2'>{parseInt(data.v.blockID._hex, 16)} {data.v.forJoinID > 0 && `(for Join ID ${data.v.forJoinID})`}</td>
                    </tr>
                    
                    {
                        data.type == 'Incoming' &&
                        <tr>
                            <td className='font-semibold border border-slate-300 break-normal'>From</td>
                            <td className='border border-slate-300' colSpan="3">{data.v.sender.toLowerCase() == currentAccount ? 'You' : data.v.sender.toLowerCase()}</td>
                        </tr>
                    }
                    
                    {
                        data.type == 'Outgoing' && 
                        <tr>
                            <td className='font-semibold border border-slate-300 break-normal'>To</td>
                            <td className='border border-slate-300' colSpan="3">{data.v.recipient.toLowerCase()}</td>
                        </tr>
                    }
                    <tr>
                        <td className='font-semibold border border-slate-300 break-normal'>Creation Date & Time</td>
                        <td className='border border-slate-300' colSpan="3">{tsf.getDateTime(parseInt(data.v.timestamp._hex, 16))}</td>
                    </tr>
                    {
                        metadata instanceof Object &&
                        <>
                            <tr>
                                <td className='font-semibold border border-slate-300 break-normal'>Path</td>
                                <td className='border border-slate-300' colSpan="3">{metadata.path}</td>
                            </tr>
                            <tr>
                                <td className='font-semibold border border-slate-300 break-normal'>Comment</td>
                                <td className='border border-slate-300' colSpan="3">{metadata.comment}</td>
                            </tr>
                            <tr>
                                <td className='font-semibold border border-slate-300 break-normal'>File (latest - V{metadata.cidlist.length})</td>
                                <td className='border border-slate-300' colSpan="3">
                                    {metadata.cidlist.at(-1).file.map((f, i) => (<div key={f.name}>
                                        {i < 5 && (data.v.localPin ?
                                            <a className='text-yellow-300' href={`http://${f.cid}.ipfs.localhost:8080`} target='_blank'>{i + 1}. {f.name} ({f.size})</a> :
                                            <a className='text-yellow-300' href={`https://${metadata.cidlist[0].cid}.ipfs.nftstorage.link/${f.name}`} target='_blank'>{i + 1}. {f.name} ({f.size})</a>)}

                                        {i == 5 && <a>And {metadata.cidlist.at(-1).file.length - 5} more file(s)</a>}
                                    </div>))}
                                </td>
                            </tr>
                        </>
                    }
                </tbody>
            </table>

            <div>
                <select className='text-black border-solid rounded-md p-1 mt-2' id='actionMenu' onChange={actionTriggered}>
                    <option className='font-bold hidden' value='default'>-Options-</option>
                    {!downloadProgress && <option value='download'>Download Latest Version</option>}
                    <option value='version'>Version</option>
                    <option value='permission'>Permission</option>
                    <option className='text-red-500' value='delete'>Delete All</option>
                </select>
                {downloadProgress}
            </div>
        </div>
    );
}


const InfoCardJoin = ({joinData: jd, currentAccount: acc, approvedBlockID: apbid, ownFileBlock: fb, isInbox}) => {
    const [fileLoading, setLoading] = useState(false);
    const blockID = parseInt(jd.blockID._hex, 16);

    const showDetail = () => {
        setLoading(true);
        const mdatURL = `http${fb.localPin ? "" : "s"}://${fb.intMetadataCID}.ipfs.${fb.localPin ? "localhost:8080" : "nftstorage.link"}`;
        const request = new HTTPRequest(mdatURL, "GET");
        
        try {
            request.sendAwait().then(res => {
                setLoading(false);

                const resobj = JSON.parse(res);
                var info = `
Block ID: ${fb.blockID}
Type of Pinning: ${fb.localPin ? 'Local Node' : 'NFT.Storage (Remote)'}
Creation Date & Time: ${tsf.getDateTime(fb.timestamp)}
Path: ${resobj.path}
Comment: ${resobj.comment}
First 5 files: 
${resobj.cidlist[resobj.cidlist.length - 1].file.slice(0, 5).map((dict, i) => `${i + 1}. ${dict.name}`).join('\n')}
`.trim();
                alert(info);
            });
            setLoading(false);
        } catch (error) {
            console.error(error);
            alert("Couldn't load data.")
        }

    }

    useEffect(() => {
    }, []);

    return (
        <div className={`border ${acc? 'border-yellow-400' : 'border-purple-500'} rounded-lg p-4 m-4 inline-block`}>
            <div className="font-bold text-lg mb-4">
                <div className='underline'>{acc? 'Received':'Sent'}</div>
                <div>ID: {parseInt(jd.joinID._hex, 16)} ➡ file block #{blockID} {isInbox && (fileLoading ? '(loading)' : <button onClick={showDetail}>ℹ</button>)}</div>
                <div className='break-all'>Requested {isInbox? <>by: {jd.joiner}</> : <>to: {jd.blockOwner}</>} </div>
            </div>
            <div className="text-sm text-cyan-200">
                <div>Created at: {tsf.getDateTime(jd.creationtime)}</div>
                {jd.decisiontime > 0 && <div>Decision made at: {tsf.getDateTime(jd.decisiontime)}</div>}
                <div>Status: 
                    <a className='mx-1'>
                        {(() => {
                            switch(jd.status) {
                                case 0:
                                    return jd.decisiontime > 0 ? `Approved ${apbid && `(block ID ref #${apbid})`}` : 'Pending';
                                case 1:
                                    return 'Rejected';
                                case 2:
                                    return 'Cancelled by the requester';
                                default:
                                    return '';
                        }})()}
                    </a>
                </div>
            </div>

            {jd.decisiontime == 0 &&
                <div className='my-2'>
                    {isInbox ?
                        <>
                            <Button
                                sx={{ textTransform: 'none', wordBreak: 'break-all', marginRight: '2px' }}
                                variant='contained'
                                size='small'
                                onClick={() => { contract.evaluateJoinInbox(jd.joinID, acc, jd.joiner, true, fb.intMetadataCID) }}>
                                Approve
                            </Button>
                            <Button
                                sx={{ textTransform: 'none', wordBreak: 'break-all', marginRight: '2px' }}
                                variant='contained'
                                size='small'
                                onClick={() => { contract.evaluateJoinInbox(jd.joinID, '', jd.joiner, false, '') }}>
                                Reject
                            </Button>
                        </> :
                        <Button
                            sx={{ textTransform: 'none', wordBreak: 'break-all', marginRight: '2px' }}
                            variant='contained'
                            size='small'
                            onClick={() => { contract.cancelJoin(jd.joinID) }}>
                            Cancel
                        </Button>}
                </div>}
            
        </div>
    );
}

export { InfoCardFile, InfoCardJoin };