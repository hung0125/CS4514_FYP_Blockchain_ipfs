import Popup from 'reactjs-popup';
import { Line } from '../../general/Decorations';
import TSFormatter from '../../../../utils/TSFormatter';
import { useContext, useState } from 'react';
import { Button } from '@mui/material';
import { useEffect } from 'react';
import MetadataUtils from '../../../../utils/MetadataUtils';
import strs from '../../../../utils/strings.json'
import cloneDeep from 'clone-deep';
import { updateVersion as cUpdateVersion } from '../../../../context/operations/EthContractFileEvent';
import PopLinkInfo from './VersionControlComponents/PopLinkInfo';
import BatchDownloader from '../../../../utils/BatchDownloader';
import { ContextSharedData } from '../../../../context/ContextSharedData';
import { EthContextAccount } from '../../../../context/EthContextAccount';


const tsf = new TSFormatter();
const downloader = new BatchDownloader();
const datUtils = new MetadataUtils();

const PopVersionControl = (props) => {
  const {dictSet} = useContext(ContextSharedData);
  const {currentAccount} = useContext(EthContextAccount);
  const [expand, setExpand] = useState([]);
  const [isError, setError] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showLinkInfo, setLinkInfo] = useState(false);
  const [actionVersionIndex, setActionVersionIndex] = useState(0);
  const [actionFileIndex, setActionFileIndex] = useState(0);
  const [metadataCID, setMetadataCID] = useState(props.metadataCID);
  const [searchResult, setSearchResult] = useState([]);
  const [prepDownload, setPrepDownload] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');

  const configExpand = (bool, index) => {
    var arr = expand.slice();
    arr[index] = bool;
    setExpand(arr);
  };

  const actionTriggered = (e) => {
    const option = e.target.value.split('-');
    e.target.value = 'default';
    switch (option[0]) {
      case 'Get Link':
        setActionVersionIndex(option[1]);
        setActionFileIndex(option[2]);
        setLinkInfo(true);
    }
  }

  const updateVersion = () => {
    const fileInput = document.getElementById('fupload').files;
    if (fileInput.length == 0) {
      return alert(strs.Form_validate_file);
    }

    setUpdating(true);
    console.log(cloneDeep(props.metadata));

    const block = props.blockData;
    const byRecipient = currentAccount.toLowerCase() == block.recipient.toLowerCase() ? true : false;

    //contract call
    cUpdateVersion(
      block.sender == block.recipient? false : byRecipient,
      block.localPin, 
      block.sender,
      block.recipient,
      block.blockID,
      document.getElementById('updateComment').value,
      cloneDeep(props.metadata),
      fileInput,
      metadataCID).then(replyMdat => {
        if (replyMdat) {
          setSearchResult([]);
          props.setMetadata(replyMdat.newMdat);
          setMetadataCID(replyMdat.newMetaCID);
          dictSet('metadata', parseInt(props.blockData.blockID, 16) , replyMdat.newMdat);
          configExpand(true, 0);
        }
        setUpdating(false)
      })
  };

  const fsearch = () => {
    const keyword = document.getElementById('fkeyword').value.toLowerCase();
    const version = document.getElementById('fversion').value;

    var mdat = props.metadata.cidlist;
    var searchValid = [];

    for (let i = 0; i < mdat.length; i++) {
      searchValid.push(Array(mdat[i].file.length).fill(false));
      if (version === 'Any' || version !== 'Any' && parseInt(version) === i + 1) {
        for (let j = 0; j < mdat[i].file.length; j++) {
          if (mdat[i].file[j].name.toLowerCase().includes(keyword))
            searchValid[i][j] = true;
        }
      }
    }
    setSearchResult(searchValid);
    console.log(searchValid);
  }

  const downloadAll = (versionIdx) => {
    setPrepDownload(true);
    var urls = [];
    var names = [];
    var mdat = props.metadata.cidlist;
    mdat[mdat.length - 1 - versionIdx].file.forEach(f => {
        urls.push(props.blockData.localPin ?
            `http://${f.cid}.ipfs.localhost:8080` : `https://${mdat[mdat.length - 1 - versionIdx].cid}.ipfs.nftstorage.link/${f.name}`);
        names.push(f.name);
    });

    console.log(urls);
    console.log(names);

    setDownloadProgress('...');
    downloader.download(urls, names, setDownloadProgress, setPrepDownload);
  }

  const compareVer = (versionIdx) => {
    const cidlist = props.metadata.cidlist;
    
    const curIdx = cidlist.length - versionIdx - 1;
    var targetIdx = prompt("Enter a version number you'd like to compare with.");
    if (!targetIdx)
      return;
    targetIdx = parseInt(targetIdx) - 1;

    if (Number.isInteger(targetIdx) && targetIdx >= 0 && targetIdx < cidlist.length) {
      if (targetIdx === curIdx) {
        return alert("Target can't be the current version.");
      }
      
      console.log('Current cid list: ', cidlist[curIdx]);
      console.log('Target cid list:', cidlist[targetIdx]);

      const oldv = targetIdx > curIdx? cidlist[curIdx] : cidlist[targetIdx];
      const newv = targetIdx < curIdx? cidlist[curIdx] : cidlist[targetIdx];

      localStorage.setItem('vercomp', JSON.stringify({
        newverNum: targetIdx > curIdx? targetIdx + 1 : curIdx + 1,
        oldverNum: targetIdx < curIdx? targetIdx + 1 : curIdx + 1,
        newver: newv, 
        oldver: oldv, 
        localPin: props.blockData.localPin}));
      window.location.href = '/vercomp';
      
    }else {
      alert('Invalid version number.');
    }
  }

  useEffect(() => {
    if (typeof props.metadata?.cidlist?.length !== 'undefined') {
      setExpand(new Array(props.metadata.cidlist.length).fill(false));
    }
    else {
      setError(true);
    }
  }, []);

  useEffect(() => {
    if (showLinkInfo)
      document.getElementById('PopVersionControlBody').style.filter = 'brightness(50%)';
    else
      document.getElementById('PopVersionControlBody').style.filter = 'brightness(100%)';
  }, [showLinkInfo]);

  return (
    <Popup open={true} onClose={props.onClose} nested>
      {showLinkInfo && <PopLinkInfo
        QRLink={props.blockData.localPin ?
          `http://${props.metadata.cidlist[actionVersionIndex].file[actionFileIndex].cid}.ipfs.localhost:8080` :
          `https://${props.metadata.cidlist[actionVersionIndex].cid}.ipfs.nftstorage.link/${props.metadata.cidlist[actionVersionIndex].file[actionFileIndex].name}`}
        onClose={() => setLinkInfo(false)} />}
      <div className='bg-gray-700 text-cyan-300 grid justify-items-end rounded-t-md'><button onClick={props.onClose}>❌</button></div>
      <div id='PopVersionControlBody' className='bg-white rounded-b-md p-3 overflow-auto max-h-screen max-w-screen-md'>
        {isError && <div>No data.</div>}
        {/* {!isError && <div>{metadataCID}</div>} */}
        {!isError && <div className='bg-[#256D85] p-2 rounded-md text-white'>
          <input type='file' id='fupload' multiple /><br />
          Update comment: <input className='border-2 border-gray-600 text-black' type='text' id='updateComment' />
          {updating ? ' processing...' : (<Button
            sx={{ textTransform: 'none', wordBreak: 'break-all', margin: '3px' }}
            variant='contained'
            size='small'
            onClick={() => { updateVersion() }}>
            Add Version
          </Button>)}
          <Line />
          Find file: <input className='border-2 border-gray-600 text-black' type='text' id='fkeyword' /> in version
          <select className='text-black border-2 border-gray-600 m-1' id='fversion'>
            <option defaultValue={''}>Any</option>
            {props?.metadata?.cidlist?.map((v, index) => (
              <option key={index}>{index + 1}</option>
            ))}
          </select>
          <Button
            sx={{ textTransform: 'none', wordBreak: 'break-all', margin: '3px' }}
            variant='contained'
            size='small'
            onClick={() => { fsearch() }}>
            search
          </Button>
          {searchResult.length > 0 && 
            <Button
            sx={{ textTransform: 'none', wordBreak: 'break-all', margin: '3px' }}
            variant='contained'
            size='small'
            onClick={() => { setSearchResult([]) }}>
            clear search
            </Button>
          }
        </div>}

        {!isError &&
          props?.metadata?.cidlist?.slice().reverse().map((version, vIndex) => (
            <div key={vIndex}>
              {(searchResult.length == 0 || searchResult[props?.metadata?.cidlist?.length - vIndex - 1].includes(true)) && (<>
                <h1 className='underline'>Version {props?.metadata?.cidlist?.length - vIndex}</h1>
                {!props.blockData.localPin && (<a>Root CID: <Button
                  sx={{ textTransform: 'none', wordBreak: 'break-all', padding: '0' }}
                  varient='text' size='small'
                  onClick={() => window.open(`https://${version.cid}.ipfs.nftstorage.link/`, '_blank')}>{version.cid}</Button></a>)}

                <h1>Updated by: {version?.by_recipient ? 'Recipient' : 'Sender'}</h1>

                <h1>Update comment: {version?.update_comment}</h1>

                <h1>Upload date & time (IPFS): {version?.update_timestamp}</h1>

                <h1>File ({version.file.length}) ({datUtils.getSize(version.file)}): </h1>
                
                <Button sx={{ textTransform: 'none', padding: '0px', margin: '2px' }} size='small' variant='outlined' onClick={() => {
                  expand[vIndex] ?
                    configExpand(false, vIndex) : configExpand(true, vIndex)
                }}>
                  {expand[vIndex] ? 'Hide' : 'Show'}
                </Button>

                {!prepDownload && <Button sx={{ textTransform: 'none', padding: '2px', paddingLeft: '2px', paddingRight: '2px', margin: '2px' }} size='small' variant='contained' 
                onClick={() => {downloadAll(vIndex)}}>
                  Download All
                </Button>}

                <Button sx={{ bgcolor: '#43A663', textTransform: 'none', padding: '2px', paddingLeft: '2px', paddingRight: '2px', margin: '2px' }} size='small' variant='contained' 
                onClick={() => {compareVer(vIndex)}}>
                  Compare With
                </Button>
                
                {prepDownload && <>{downloadProgress}</>}
                
                {expand[vIndex] && (
                  <div><Line /><div className='overflow-auto max-h-96 max-w-screen-md'>
                    {/* try w-full --> min-w-full */}
                    <table className='border-collapse border border-slate-400 table-fixed min-w-full'>
                      <tbody>
                        <tr>
                          <th className='border border-slate-300'>Name</th>
                          <th className='border border-slate-300'>Size</th>
                          <th className='border border-slate-300'>Last Modified</th>
                          <th className='border border-slate-300'>Actions</th>
                        </tr>
                        {version.file.map((f, fIndex) => (
                          <>
                            {(searchResult.length == 0 || searchResult[props?.metadata?.cidlist?.length - vIndex - 1][fIndex]) && (
                              <tr key={fIndex}>
                                <td className='border border-slate-300'><Button
                                  sx={{ textTransform: 'none', wordBreak: 'break-all', textAlign: 'start' }}
                                  size='small'
                                  onClick={() => window.open(props.blockData.localPin ?
                                    `http://${f.cid}.ipfs.localhost:8080` : `https://${version.cid}.ipfs.nftstorage.link/${f.name}`, '_blank')}
                                >{f.name}</Button></td>
                                <td className='border border-slate-300'>{f.size}</td>
                                <td className='border border-slate-300'>{tsf.getDateTime(f.timestamp)}</td>
                                <td className='border border-slate-300'>
                                  <select id='actionMenu' onChange={actionTriggered}>
                                    <option className='hidden' value='default'>Select</option>
                                    <option value={`Get Link-${props?.metadata?.cidlist?.length - vIndex - 1}-${fIndex}`}>Get Link</option>
                                  </select>
                                </td>
                              </tr>
                            )}
                          </>

                        ))}
                      </tbody>
                    </table>
                  </div></div>)}
                <Line />
              </>)}
            </div>
          ))}

      </div>
    </Popup>
  );
}

export default PopVersionControl;