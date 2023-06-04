//Track change test: https://github.com/hung0125/3343GP_FYP_ver_ctrl_test_Nov6/commit/fa06e190c94c0672eb2d5f840eeb57990d4636fe

import React, { useEffect, useState } from "react";
import Navbar from "./components/general/Navbar";
import Footer from "./components/general/Footer";
import VersionComparator from "../utils/VersionComparator";
import MetadataUtils from "../utils/MetadataUtils";
import { Button } from '@mui/material';
import TSFormatter from "../utils/TSFormatter";
import { Line } from "./components/general/Decorations";

const vcomp = new VersionComparator();
const dutil = new MetadataUtils;
const tsf = new TSFormatter();

const getURL = (version, fileObj, isLocalPin) => {
    const prefix = isLocalPin ? 'http://' : 'https://';
    const domain = isLocalPin ? `${fileObj.cid}.ipfs.localhost:8080` : `${version.cid}.ipfs.nftstorage.link/${fileObj.name}`;
    return `${prefix}${domain}`;
}

const getFileHighlight = (fileName, result) => {
    if (result.nameChanges.addMap[fileName]) 
        return '#90E9AD';
    else if (result.nameChanges.delMap[fileName])
        return '#F59F94';
    else if (result.modMap[fileName])
        return '#94E5F5';
        return 'white';
}

const FileTable = ({version, localPin, result}) => {
    return (
        <div className="flex justify-center items-center">
            <table className='border-collapse border border-slate-400 table-fixed w-11/12 bg-slate-600'>
                <tbody>
                    <tr className="bg-slate-400 text-blue-900">
                        <th className='border border-slate-300'>Name</th>
                        <th className='border border-slate-300'>Size</th>
                        <th className='border border-slate-300'>Last Modified</th>
                        <th className='border border-slate-300'>Option</th>
                    </tr>

                    {version.file.map((f, fIndex) => (

                        <tr key={fIndex}>
                            <td className='border border-slate-300'><Button
                                sx={{ textTransform: 'none', wordBreak: 'break-all', textAlign: 'start', color: getFileHighlight(f.name, result) }}
                                size='small'
                                onClick={() => window.open(localPin ?
                                    `http://${f.cid}.ipfs.localhost:8080` : `https://${version.cid}.ipfs.nftstorage.link/${f.name}`, '_blank')}
                            >{f.name}</Button></td>
                            <td className='border border-slate-300'>{f.size}</td>
                            <td className='border border-slate-300'>{tsf.getDateTime(f.timestamp)}</td>
                            <td className='border border-slate-300'>
                                <div className="flex justify-center">
                                    <Button
                                        sx={{ textTransform: 'none', wordBreak: 'break-all', textAlign: 'start', color: 'white' }}
                                        onClick={() => { navigator.clipboard.writeText(f.name); alert('Copied name to clipboard') }}
                                    >📋Copy</Button>
                                </div> 
                            </td>
                        </tr>

                    ))}

                </tbody>
            </table>
        </div>
    );
}

const InfoCard = ({versionNum, version, compareVersion}) => {
    return (
        <div className="border border-blue-300 rounded-lg p-4 m-4 w-2/5 inline-block">
            <div className="font-bold text-lg mb-4">
                <div className='underline'>Version {versionNum}</div>
                <div>Updated by: {version.by_recipient? 'Recipient' : 'Sender'}</div>
                <div>Update comment: {version.update_comment ? version.update_comment : 'N/A'}</div>
            </div>
            <div className="text-sm text-cyan-200">
                <div>Number of files: {version.file.length} </div>
                <div>Total size: {dutil.getSize(version.file)} 
                    {compareVersion && <a>{` (${dutil.sizeChanged(version.file, compareVersion.file)})`}</a>}</div>
                <div>Updated at: {version.update_timestamp}</div>
            </div>
        </div>
    );
}

const getCompareLineColor = (op, isMainText) => {
    if (op === '+') {
        return isMainText ? 'bg-[#E6FFEC]' : 'bg-[#CCFFD8]';
    }else if (op === '-') {
        return isMainText ? 'bg-[#FFEBE9]' : 'bg-[#FFD7D5]';
    }else
        return isMainText ? 'white' : 'bg-slate-100';
}

const DocCompare = ({operations}) => {

    return (
        <div className="bg-white text-gray-700">
            <table>
                <tbody>
                    <tr className="bg-slate-400">
                        <th className='border border-slate-300'>Ln. old</th>
                        <th className='border border-slate-300'>Ln. new</th>
                        <th className='border border-slate-300'>Op</th>
                        <th className='w-full border border-slate-300'>Highlights</th>
                    </tr>

                    {operations.map((oper, i) => (
                        <tr key={i} className="text-sm">
                            <td className={`select-none align-top ${getCompareLineColor(oper.op, 0)}`}>
                                <a className="flex justify-end mx-1">
                                    {oper.op === '-' && oper.line || !oper.op && oper.line.old}
                                </a>
                            </td>
                            <td className={`select-none align-top border-r ${getCompareLineColor(oper.op, 0)}`}>
                                <a className="flex justify-end mx-1">
                                    {oper.op === '+' && oper.line || !oper.op && oper.line.new}
                                </a>
                            </td>
                            <td className={`select-none align-top ${getCompareLineColor(oper.op, true)}`}><a className="flex justify-center">{oper.op}</a></td>
                            <td className={`align-top ${getCompareLineColor(oper.op, true)}`}><pre className="whitespace-pre-wrap break-all font-mono">{oper.text}</pre></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const VersionCompare = () => {
    const data = JSON.parse(localStorage.getItem('vercomp'));
    const [result, setResult] = useState({
        nameChanges: {
            added: [],
            addMap: {},
            deleted: [],
            delMap: {}
        },
        textModifications: [],
        unprocessedChanges: [],
        modMap: {},
        errors: []
    });
    const [showFileTable, setShowTable] = useState({ old: false, new: false });
    const [progress, setProgress] = useState('Loading...');
    const [compareToggles, setToggle] = useState({});

    useEffect(() => {
        //localStorage.removeItem('vercomp');
        console.log(data);
        vcomp.compare(data.oldver, data.newver, data.localPin, setProgress).then(res => {
            console.log(res); 
            setResult(res);
        });
    }, []);
    
    return(
        <div id='compareBody' className='bg-[#002B5B] text-white'>
            <Navbar/>
            {/* {compareOperations && <PopTextCompare operations={compareOperations.slice(0).reverse()} onClose={() => setOps(null)}/>} */}
            <h1 className="text-xl font-bold font-sans text-center">{progress}</h1>

            <div className="inline-flex w-full justify-center items-center">
                <InfoCard versionNum={data.oldverNum} version={data.oldver}/>

                <h1 className="text-2xl font-bold font-sans text-center">▶</h1>

                <InfoCard versionNum={data.newverNum} version={data.newver} compareVersion={data.oldver} />

            </div>

            <div>
                <h1 className="text-xl font-bold font-sans p-2 text-center text-orange-500">Add/Delete Modifications</h1>
                <div className="flex justify-center">
                    <div className="border border-yellow-300 rounded-lg p-4 m-4 w-11/12 inline-block">

                        {!result?.nameChanges?.added?.length && !result?.nameChanges?.deleted?.length && 'No Updates.'}

                        {result?.nameChanges?.added?.length > 0 && <>
                            <h1 className="underline">Added</h1>
                            {result.nameChanges.added.map((file, i) => (
                                <p key={i} className="text-[#90E9AD]"><a href={getURL(data.newver, file, data.localPin)} target="_blank">

                                    {`${i + 1}) ${file.name} | ${file.size} | ${tsf.getDateTime(file.timestamp)} `}
                                </a></p>
                            ))}
                        </>}

                        {result?.nameChanges?.deleted?.length > 0 && <>
                            <h1 className="underline">Deleted</h1>
                            {result.nameChanges.deleted.map((file, i) => (
                                <p key={i} className="text-[#F59F94]"><a href={getURL(data.oldver, file, data.localPin)} target="_blank">

                                    {`${i + 1}) ${file.name} | ${file.size} | ${tsf.getDateTime(file.timestamp)} `}</a></p>
                            ))}
                        </>}

                    </div>
                </div>
                <Line />
            </div>

            <div>
                <h1 className="text-xl font-bold font-sans p-2 text-center text-orange-500">Text Documents Modifications</h1>
                <div className="flex justify-center">
                    <div className="border border-yellow-300 rounded-lg p-4 m-4 w-11/12 inline-block">

                        {!result.textModifications.length && 'No Updates.'}
                        {result.textModifications.map((record, i) => (
                            <div key={i} className="py-2">
                                <p className='underline'>Mod #{i + 1}</p>
                                <p>OLD: <a className="text-[#94E5F5]" href={getURL(data.oldver, record.oldFile, data.localPin)} target="_blank">
                                    {`${record.oldFile.name} | ${record.oldFile.size} | ${tsf.getDateTime(record.oldFile.timestamp)} `}
                                </a></p>

                                <p>NEW: <a className="text-[#94E5F5]" href={getURL(data.newver, record.newFile, data.localPin)} target="_blank">
                                    {`${record.newFile.name} | ${record.newFile.size} | ${tsf.getDateTime(record.newFile.timestamp)} `}
                                </a></p>
                                <p>Additions: {record.ops.filter(r => r.op === '+').length} | Deletions: {record.ops.filter(r => r.op === '-').length}</p>

                                <p><Button
                                    sx={{ textTransform: 'none', padding: '2px', paddingLeft: '2px', paddingRight: '2px', margin: '2px', color: '#92FBB4' }}
                                    variant="outlined"
                                    size="small"
                                    onClick={() => {
                                        const enabled = compareToggles[record.newFile.name];
                                        setToggle(prevState => ({ ...prevState, [record.newFile.name]: enabled ? false : true }));
                                    }}
                                >{compareToggles[record.newFile.name] ? '🔼' : '🔽'}</Button></p>

                                {compareToggles[record.newFile.name] && <DocCompare operations={record.ops} />}
                                {i < result.textModifications.length - 1 && <Line />}
                            </div>
                        ))}

                    </div>
                </div>
                <Line />
            </div>

            <div>
                <h1 className="text-xl font-bold font-sans p-2 text-center text-orange-500">Other Modifications {'(> 500 KB / Unsupported Extensions for Tracking)'}</h1>
                <div className="flex justify-center">
                    <div className="border border-yellow-300 rounded-lg p-4 m-4 w-11/12 inline-block">

                        {!result?.unprocessedChanges?.length && 'No Updates.'}

                        {result?.unprocessedChanges?.length > 0 && <>
                            {result.unprocessedChanges.map((record, i) => (
                                <div key={i} className="py-2">
                                    <p className='underline'>Mod #{i + 1}</p>
                                    <p>OLD: <a className="text-[#94E5F5]" href={getURL(data.oldver, record.oldFile, data.localPin)} target="_blank">
                                        {`${record.oldFile.name} | ${record.oldFile.size} | ${tsf.getDateTime(record.oldFile.timestamp)} `}
                                    </a></p>

                                    <p>NEW: <a className="text-[#94E5F5]" href={getURL(data.newver, record.newFile, data.localPin)} target="_blank">
                                        {`${record.newFile.name} | ${record.newFile.size} | ${tsf.getDateTime(record.newFile.timestamp)} `}
                                    </a></p>
                                    {i < result.unprocessedChanges.length - 1 && <Line />}
                                </div>
                            ))}
                        </>}

                    </div>
                </div>
                <Line />
            </div>

            <div>
                <h1 className="text-xl font-bold font-sans p-2 text-center text-orange-500">Processing Errors</h1>
                <div className="flex justify-center">
                    <div className="border border-yellow-300 rounded-lg p-4 m-4 w-11/12 inline-block">

                        {!result?.errors?.length && 'No Updates.'}

                        {result?.errors?.length > 0 && <>
                            {result.errors.map((record, i) => (
                                <div key={i} className="py-2">
                                    <p className='underline'>Error #{i + 1}</p>
                                    <p>OLD: <a href={getURL(data.oldver, record.oldFile, data.localPin)} target="_blank">
                                        {`${record.oldFile.name} | ${record.oldFile.size} | ${tsf.getDateTime(record.oldFile.timestamp)} `}
                                    </a></p>

                                    <p>NEW: <a href={getURL(data.newver, record.newFile, data.localPin)} target="_blank">
                                        {`${record.newFile.name} | ${record.newFile.size} | ${tsf.getDateTime(record.newFile.timestamp)} `}
                                    </a></p>
                                    <p>Reason: {record.error}</p>
                                    {i < result.unprocessedChanges.length - 1 && <Line />}
                                </div>
                            ))}
                        </>}

                    </div>
                </div>
                <Line />
            </div>

            <h1 className="text-xl font-bold font-sans p-2 text-center text-orange-500">
                List of Files (Version {data.oldverNum})
                <Button
                    sx={{ textTransform: 'none', textAlign: 'start', color: 'white' }}
                    variant="outlined"
                    size='small'
                    onClick={() => { setShowTable({old: showFileTable.old ? false : true, new: showFileTable.new}) }}
                >{showFileTable.old? '🔼' : '🔽'}</Button>
            </h1>

            {showFileTable.old && <FileTable version={data.oldver} localPin={data.localPin} result={result}/>}
            
            <h1 className="text-xl font-bold font-sans p-2 text-center text-orange-500">
                List of Files (Version {data.newverNum})
                <Button
                    sx={{ textTransform: 'none', textAlign: 'start', color: 'white'}}
                    variant="outlined"
                    size='small'
                    onClick={() => { setShowTable({old: showFileTable.old, new: showFileTable.new ? false : true}) }}
                >{showFileTable.new? '🔼' : '🔽'}</Button>
            </h1>

            {showFileTable.new && <FileTable version={data.newver} localPin={data.localPin} result={result}/>}

            <Footer/>
        </div>
    );
};

export default VersionCompare;