import React, { useContext, useEffect, useState } from 'react';
import { InfoCardFile, InfoCardJoin } from './components/InfoCards';
import strs from '../../../utils/strings.json';
import { EthContextAccount } from '../../../context/EthContextAccount';
import { getIncomingEvents, getOutgoingEvents } from '../../../context/operations/EthContractFileRetrival';
import TSFormatter from '../../../utils/TSFormatter';
import { ContextPath } from '../../../context/ContextPath';
import { ContextPathSuggester } from '../../../context/ContextPathSuggester';
import FilterSortBoard from './components/FilterSortComponents/FilterSortBoard';
import EthContractJoinRequest from '../../../context/operations/EthContractJoinRequest';
import { Line } from '../general/Decorations';
import { Button } from '@mui/material';

const TSF = new TSFormatter();
const contractJoin = new EthContractJoinRequest();

const FileExplorer = () => {
    const { currentAccount } = useContext(EthContextAccount);
    const { reset, getTreePathDict, getReady } = useContext(ContextPath);
    const { addSuggestionPath } = useContext(ContextPathSuggester);
    //current file event list
    const [fileEventsIn, setFileEventsIn] = useState([]);
    const [fileEventsOut, setFileEventsOut] = useState([]);
    const [qualifier, setQualifier] = useState({}); //determine whether a record with such block ID should be displayed
    const [lastUpdated, setLastUpdated] = useState('-');
    const [tabVal, setTabVal] = useState('Incoming');

    //Folder system related
    const [folderMode, setFolderMode] = useState(false);
    const [pathDict, setPathDict] = useState({});
    const [curPathDict, setCurPathDict] = useState({});
    const [folders, setFolders] = useState([]);
    const [pathHistory, setPathHistory] = useState([]);
    const [backupPath, setBackupPath] = useState([]);

    //Filter and sorting
    const [filterMode, setFilterMode] = useState(false);

    //Join requests related
    const [joinInbox, setJoinInbox] = useState([]);
    const [joinOutbox, setJoinOutbox] = useState([]);
    const [blockFileMap, setBlockFileMap] = useState({});
    const [approvedJoinMap, setApprovedJoinMap] = useState({});
    const [dispJoin, setDispJoin] = useState({in: true, out: true});

    //reset folder view value
    const exitFolderView = (eraseBackup) => {
        setFolderMode(false);
        setPathDict({});
        setFolders([]);
        setBackupPath(eraseBackup? [] : pathHistory);
        setPathHistory([]);  
    }

    //get files in tree structure
    const configFolderList = () => {
        var checked = document.getElementById('folderview').checked;
        var curTabVal = document.getElementById('tabs').value;
        console.log(getReady());
        
        if (checked) {
            if ((curTabVal === 'Incoming' && getReady() === fileEventsIn.length) 
            || (curTabVal === 'Outgoing' && getReady() === fileEventsOut.length)) {
                var pathDict = getTreePathDict();
                setPathDict(pathDict);
                setFolders(Object.keys(pathDict));
                setFolderMode(true);

                console.log(getTreePathDict());
                console.log(getReady());
            }else {
                alert('Some files are still in loading progress. Please wait.');
                document.getElementById('folderview').checked = false;
            }
        }else {
            exitFolderView();
            reset();
        }
    }

    const enterFolder = (folder) => {
        setPathHistory(oldArray => [...oldArray,folder]);
        var newDict = pathDict;
        for (let i = 0; i < pathHistory.length; i++) {
            newDict = newDict[pathHistory[i]];
        }
        //state not yet updated, manually level up once
        newDict = newDict[folder];
        setCurPathDict(newDict);
        setFolders(Object.keys(newDict));
    }

    const goPrevFolder = () => {
        setPathHistory(pathHistory.slice(0, -1));
        var newDict = pathDict;
        for (let i = 0; i < pathHistory.length-1; i++) {
            newDict = newDict[pathHistory[i]];
        }
        setCurPathDict(newDict);
        setFolders(Object.keys(newDict));
    }

    const jumpToBackupPath = () => {
        var curTabVal = document.getElementById('tabs').value;
        if ((curTabVal === 'Incoming' && getReady() === fileEventsIn.length) 
        || (curTabVal === 'Outgoing' && getReady() === fileEventsOut.length)) {
            document.getElementById('folderview').checked = true;
            setFolderMode(true);
            setPathDict(getTreePathDict());
            setPathHistory(backupPath);
            var pathDict = getTreePathDict();
            try {
                for (let i = 0; i < backupPath.length; i++) {
                    pathDict = pathDict[backupPath[i]];
                }   
                setCurPathDict(pathDict);
                setFolders(Object.keys(pathDict));
                setBackupPath([]);
            }catch(error) {
                alert('It seems that there is no file in the previous folder...');
                exitFolderView();
                document.getElementById('folderview').checked = false;
            }
        }else {
            alert('Some files are still in loading progress. Please wait.');
        }
    }
    
    //load data from blockchain
    const fetchData = (eraseBackup) => {
        setFileEventsIn([]);
        setFileEventsOut([]);
        setJoinInbox([]);
        setJoinOutbox([]);

        var curTabVal = document.getElementById('tabs').value;
        setTabVal(curTabVal);

        if (currentAccount) {
            const qualifiertmp = {};
            const blockMapTmp = {};
            const approvedJoinTmp = {};
        
            const update = (eventGetter, setEvents) => {
                eventGetter(currentAccount).then(dat => {
                    const tmp = dat.slice(0).reverse();
                    setEvents(tmp);        
                    
                    for (let i = 0; i < tmp.length; i++) {
                        const tmpbid = parseInt(tmp[i].blockID, 16);

                        qualifiertmp[tmpbid] = true;
                        blockMapTmp[tmpbid] = tmp[i];
                        approvedJoinTmp[parseInt(tmp[i].forJoinID, 16)] = tmpbid; 
                    }
                    setQualifier(qualifiertmp);
                    setBlockFileMap(blockMapTmp);
                    setApprovedJoinMap(approvedJoinTmp);
                    
                });
            };

            if (curTabVal === 'Incoming') {
                update(getIncomingEvents, setFileEventsIn);
            } else if (curTabVal === 'Outgoing') {
                update(getOutgoingEvents, setFileEventsOut);
            }else if (curTabVal === 'Joinreq') {
                contractJoin.getJoin().then(dat => {
                    update(getIncomingEvents, setFileEventsIn);
                    update(getOutgoingEvents, setFileEventsOut);
                    setJoinInbox(dat.inbox.slice(0).reverse());
                    setJoinOutbox(dat.outbox.slice(0).reverse());
                });
            }
        }
        
        setLastUpdated(TSF.getDateTime(Date.now() / 1000));

        if (document.getElementById('folderview')?.checked) {
            document.getElementById('folderview').checked = false;
            exitFolderView(eraseBackup);
        }
        
        reset();
    }

    const updateFilterMode = () => {
        var fsort = document.getElementById('filtersort').checked;
        setFilterMode(fsort);
    }

    //Join request related
    const hiderReset = () => {
        const radioGroup = document.getElementsByName('joinhider');

        for (let i = 0; i < radioGroup.length; i++) {
            radioGroup[i].checked = false;
        }
        setDispJoin({in: true, out: true});
    }

    useEffect(() => {
        if (!filterMode) fetchData();
    }, [currentAccount]);

    return (
        <div>
            <div className='flex md:flex-row flex-col items-center mx-2'>
                <div className='flex items-center'>
                    <select disabled={filterMode? true : false} id='tabs' onChange={() => fetchData(true)} className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-lg px-4 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'>
                        <option value='Incoming'>Incoming Files</option>
                        <option value='Outgoing'>Sent Files</option>
                        <option value='Joinreq'>Join Requests</option>
                    </select>
                    <h1 className='px-2'>({tabVal === 'Incoming' ? fileEventsIn.length : fileEventsOut.length})</h1>
                </div>
                
                {!folderMode && document.getElementById('tabs')?.value !== 'Joinreq' && 
                <div className='mx-1 flex flex-row flex-no-wrap'>
                    <h1 className='px-2'>Filter & Sorting (list view only)</h1>
                    <input type='checkbox' id='filtersort' onChange={updateFilterMode} /> 
                </div>}

                {!filterMode && <button id='btn_update' onClick={() => fetchData()} className='bg-[#2952e3] py-2 px-7 mx-4 rounded-full cursor-pointer hover:bg-[#2546bd]'>
                    {strs.FileEvents_Update}
                </button>}
                <h1>Last updated: {lastUpdated}</h1>
                
            </div>

            {filterMode && <FilterSortBoard tabVal={tabVal} fileEvents={tabVal == 'Incoming'? fileEventsIn : fileEventsOut} setFileEvents={tabVal == 'Incoming'? setFileEventsIn : setFileEventsOut} setQualifier={setQualifier}/>}

            {!filterMode && document.getElementById('tabs')?.value !== 'Joinreq' && 
            <div className='flex md:flex-row items-center mx-2 py-5'>
                <input type='checkbox' id='folderview' className='ml-5 mr-2 w-4 h-4' onClick={configFolderList}/> Folder View
                
                {!folderMode && backupPath.length > 0 && 
                    <button 
                        className='bg-[#2952e3] py-2 px-7 mx-4 rounded-full cursor-pointer hover:bg-[#2546bd]'
                        onClick={jumpToBackupPath}
                        >
                        Jump to Previous Folder
                    </button>}
            </div>}

            {folderMode && <div className='flex md:flex-row mx-2 py-2'>
                <a>Root/</a>
                {pathHistory.map((folder, i) => (
                    <a key={i}>{folder}/</a>
                ))}
                {pathHistory.length > 0 && <button className='ml-2 text-lg' onClick={goPrevFolder}>⬅️</button>}
                {pathHistory.length > 0 && <button 
                    className='bg-[#2952e3] px-4 mx-4 rounded-md cursor-pointer hover:bg-[#2546bd]'
                    onClick={() => addSuggestionPath(pathHistory.join('/'))}
                    >
                    Add to Form
                </button>}
            </div>}

            <Line/>
            {/* File list view related */}
            {currentAccount && !folderMode && document.getElementById('tabs')?.value == 'Incoming' &&
                fileEventsIn.map((dataArr, index) => {
                    if (qualifier[parseInt(dataArr.blockID, 16)])
                        return <InfoCardFile v={dataArr} type='Incoming' fetchData={fetchData} key={index} />;
                    else
                        return null;
            })}

            {currentAccount && !folderMode && document.getElementById('tabs')?.value == 'Outgoing' &&
                fileEventsOut.map((dataArr, index) => {
                    if (qualifier[parseInt(dataArr.blockID, 16)])
                        return <InfoCardFile v={dataArr} type='Outgoing' fetchData={fetchData} key={index} />;
                    else
                        return null;
            })}
            
            {/* Folder mode related */}
            {folderMode && folders.map((folder, i) => (
                <a key={i}>
                    {folder !== '/' && <button 
                        variant="contained" 
                        className='bg-[#82ac64] text-black py-2 px-7 mx-3 my-3 rounded-md cursor-pointer hover:bg-[#739759]'
                        onClick={()=>enterFolder(folder)}>
                        {folder}
                    </button>}
                </a>
            ))}

            {folderMode && folders.map((folder, i) => (
                <a key={i}>
                    {folder === '/' && document.getElementById('tabs') && document.getElementById('tabs').value == 'Incoming' && curPathDict[folder].map((file, i) => (
                        <InfoCardFile v={file.blockData} type='Incoming' fetchData={fetchData} metadata={file.metadata} key={i} />
                    ))}
                    {folder === '/' && document.getElementById('tabs') && document.getElementById('tabs').value == 'Outgoing' && curPathDict[folder].map((file, i) => (
                        <InfoCardFile v={file.blockData} type='Outgoing' fetchData={fetchData} metadata={file.metadata} key={i} />
                    ))}
                </a>
            ))}

            {/* Join request related */}
            {currentAccount && document.getElementById('tabs')?.value === 'Joinreq' &&
                <div className='mx-2 flex md:flex-row flex-col items-center justify-center'>
                    <form>
                        <input type='radio' id='hideinbox' name='joinhider' className='ml-5 mr-2 w-4 h-4' onClick={()=>{setDispJoin({in: false, out: true})}}/> Show sent only
                        <input type='radio' id='hideoutbox' name='joinhider' className='ml-5 mr-2 w-4 h-4' onClick={()=>{setDispJoin({in: true, out: false})}}/> Show received only
                        <Button
                            sx={{ textTransform: 'none', wordBreak: 'break-all', margin: '1rem' }}
                            variant='contained'
                            size='small'
                            onClick={hiderReset}>
                            Reset
                        </Button>
                    </form>
                    <div className='ml-5'>
                        Input block ID: 
                        <input className='mx-2 text-gray-500 font-bold rounded-sm pl-1 w-32' type='number' id='joinblock'></input>
                        <Button
                            sx={{ textTransform: 'none', wordBreak: 'break-all', margin: '1px' }}
                            variant='contained'
                            size='small'
                            onClick={() => {document.getElementById('joinblock').value? 
                                contractJoin.requestJoinBlock(document.getElementById('joinblock').value) : 
                                alert('Please input a block ID')}}>
                            Request
                        </Button>
                    </div>
                </div>
            }

            {currentAccount && dispJoin.in && document.getElementById('tabs')?.value === 'Joinreq' &&
                joinInbox.map((record, i) => (
                    
                        <InfoCardJoin key={i}
                        joinData={record} 
                        currentAccount={currentAccount} 
                        approvedBlockID={approvedJoinMap[parseInt(record.joinID, 16)]}
                        ownFileBlock={blockFileMap[parseInt(record.blockID, 16)]} 
                        isInbox={true}/>
                ))
            }

            {currentAccount && dispJoin.out && document.getElementById('tabs')?.value === 'Joinreq' &&
                joinOutbox.map((record, i) => (
                        <InfoCardJoin key={i} 
                        approvedBlockID={approvedJoinMap[parseInt(record.joinID, 16)]} 
                        joinData={record}/>
                ))
            }

        </div>

    )
}

export default FileExplorer;