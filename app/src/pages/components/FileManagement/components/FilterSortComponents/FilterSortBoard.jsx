/*
filters:
pin type _dropdown_
has name __text__
has comment __text__
has format _dropdown__
has recipient __
only you __
date in range from _datepicker_ to _datepicker_


sort by:
file modification date
block date
latest version size 
total size
*/

import { useContext, useEffect, useState } from "react";
import RecordUtils from "../../../../../utils/RecordUtils";
import { EthContextAccount } from "../../../../../context/EthContextAccount";
import { Button } from "@mui/material";
import TSFormatter from "../../../../../utils/TSFormatter";
import { ContextSharedData } from "../../../../../context/ContextSharedData";

const ru = new RecordUtils();
const tsf = new TSFormatter();

const FilterSortBoard = ({tabVal, fileEvents, setFileEvents, setQualifier}) => {
    const { currentAccount } = useContext(EthContextAccount);
    const { sharedData } = useContext(ContextSharedData);

    //data prep
    const [addrList, setAddrList] = useState(['All']);

    //search
    const [typeOfPinning, setTypeOfPinning] = useState('All');
    const [addrFrom, setAddrFrom] = useState(null);
    const [addrTo, setAddrTo] = useState(null);

    const applySearch = () => {
        const block_ID = document.getElementById('blkid').value;
        const has_file_name = document.getElementById('fname').value;
        const has_comment = document.getElementById('cmt').value;
        const has_update_comment = document.getElementById('upcmt').value;
        var date_from = document.getElementById('datefrom').value;
        var date_to = document.getElementById('dateto').value;

        if (date_from !== '')
            date_from = tsf.dateToTimestamp(date_from);

        if (date_to !== '')
            date_to = tsf.dateToTimestamp(date_to);

        const qualres = ru.getValidRecordsIndices(fileEvents, sharedData['metadata'], typeOfPinning, addrFrom, addrTo, block_ID, has_file_name, has_comment, has_update_comment, date_from, date_to);

        setQualifier(qualres);
    }

    //dropdown trigger
    useEffect(()=>{
        setTypeOfPinning(document.getElementById('typepin').value);
        tabVal == 'Incoming'? setAddrFrom(document.getElementById('addrfrom').value) : setAddrTo(document.getElementById('addrto').value);
    }, [typeOfPinning, addrFrom, addrTo]);

    //first launch
    useEffect(()=>{
        var addrListArr = ['All'];
        addrListArr.push(...ru.getAddressList(tabVal, fileEvents));
        setAddrList(addrListArr);
    }, []);
    
    return (
        <div className='flex w-full py-5 items-center bg-[#002B5B]'>
            <div className='px-5 flex w-full md:flex-row flex-col'>
                <div className="mx-2 py-3 border border-gray">
                    <p>Filters (AND relationship):</p>

                    <p className="p-1">Type of Pinning: <></>
                        <select id='typepin' onChange={() => setTypeOfPinning(document.getElementById('typepin').value)} className='text-gray-600 rounded-sm'>
                            <option value='All'>All</option>
                            <option value='Local'>Local</option>
                            <option value='Remote'>Remote</option>
                        </select>
                    </p>

                    <div className="flex">
                        <p className="p-1">Block ID: <></>
                            <input className="text-gray-600 rounded-sm w-2/4" placeholder="Any" id='blkid' min='1' type="number"/>
                        </p>

                        <p className="p-1">Has file name: <></>
                            <input className="text-gray-600 rounded-sm w-2/4" placeholder="Any" id='fname' type="text"/>
                        </p>
                    </div>
                    
                    <div className="flex">
                        <p className="p-1">Has comment: <></>
                            <input className="text-gray-600 rounded-sm w-2/4" placeholder="Any" id='cmt' type="text"/>
                        </p>

                        <p className="p-1">Has update comment: <></>
                            <input className="text-gray-600 rounded-sm w-2/4" placeholder="Any" id='upcmt' type="text"/>
                        </p>
                    </div>
                    

                    <div className="flex">
                        {tabVal == 'Incoming' && <p className="p-1">
                            {'Address from: '}
                            <select id='addrfrom' onChange={() => setTypeOfPinning(document.getElementById('addrfrom').value)} className='text-gray-600 rounded-sm'>
                                {addrList.map((addr, i) => (
                                    <option key={i} value={addr}>{addr.toLowerCase() === currentAccount? 'You' : addr}</option>    
                                ))}
                            </select>
                        </p>}

                        {tabVal == 'Outgoing' && <p className="p-1">
                            {'Address to: '}
                            <select id='addrto' onChange={() => setTypeOfPinning(document.getElementById('addrto').value)} className='text-gray-600 rounded-sm'>
                                {addrList.map((addr, i) => (
                                    <option key={i} value={addr}>{addr}</option>    
                                ))}
                            </select>
                        </p>}
                    </div>
                    
                    <div className="flex p-1">
                        Creation date from: <input id='datefrom' className="rounded-sm text-gray-600 mx-1" type="date"/> to
                        <input id='dateto' className="rounded-sm text-gray-600 mx-1" type="date"/>
                    </div>

                    {/* <p>Sort by: </p>
                    
                    <div className="flex p-1">
                        <select id='sortoptions' onChange={() => setSort(document.getElementById('sortoptions').value)} className='text-gray-600 rounded-sm mx-1'>
                            <option value='blockid'>Block ID/Creation Date & Time</option>
                            <option value='pintype'>Type of Pinning</option>
                            <option value='filesize'>File Size</option>
                        </select> in 
                        <select id='sortorders' onChange={() => setSortOrder(document.getElementById('sortorders').value)} className='text-gray-600 rounded-sm mx-1'>
                            <option value='desc'>Descending</option>
                            <option value='asc'>Ascending</option>
                        </select> order
                    </div> */}
                    <Button
                        sx={{ textTransform: 'none', wordBreak: 'break-all', margin: '3px' }}
                        variant='contained'
                        size='small'
                        onClick={applySearch}>
                        Apply
                    </Button>
                </div>

            </div>
        </div>
    );
}
  
export default FilterSortBoard;