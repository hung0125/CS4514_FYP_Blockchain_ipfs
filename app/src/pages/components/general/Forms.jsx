import strs from '../../../utils/strings.json';
import { useContext, useEffect } from 'react';
import { Loader } from './Decorations';
import { EthContextAccount } from '../../../context/EthContextAccount';
import { ContextPath } from '../../../context/ContextPath';
import { shareFile } from '../../../context/operations/EthContractFileEvent';
import { useState } from 'react';
import { ContextPathSuggester } from '../../../context/ContextPathSuggester';
import KeywordExtractor from '../../../utils/KeywordExtractor';
import RAKE from '../../../utils/RAKE';

const Input = ({ placeholder, type, value, id, onChange }) => (
    <input
        placeholder={placeholder}
        type={type}
        value={value}
        id={id}
        className='my-2 w-full rounded-sm p-2 outline-none placeholder-gray-500 text-teal-700'
    />
);

const FileForm = () => {
    const { currentAccount, setProgressMsg, progressMsg } = useContext(EthContextAccount);
    const { findPathSuggestions } = useContext(ContextPath);
    const { addSuggestionPath, formSuggestPath } = useContext(ContextPathSuggester);
    const [isLoading, setIsLoading] = useState(false);
    const [matchPaths, setPaths] = useState([]);
    const [sharingMode, setSharing] = useState(false);
    //RAKE related
    const [keyWords, setKeywords] = useState([]);
    const [isReadingFile, setIsReadingFile] = useState(false);

    const updateSharing = () => {
        var sharing = document.getElementById('sharingMode').checked;
        setSharing(sharing);
    }

    const updateMatch = () => {
        const pathList = findPathSuggestions(document.getElementById('path').value)
        setPaths(pathList);
        if (pathList.length === 0)
            alert('Suggestions not found.')
    }

    const updateKeyword = async () => {
        const prioritizeNounAdj = document.getElementById('priorit')?.checked;
        const maxKwLength = document.getElementById('kwlength')?.value;

        setIsReadingFile(true);
        const fileInput = document.getElementById('input').files;
        if (fileInput.length == 0) {
            setIsReadingFile(false);
            return alert('Please select a file first.');
        }

        const kwe = new KeywordExtractor();

        for (let i = 0; i < fileInput.length; i++) {
            kwe.tryAddFile(fileInput[i]).then(()=>{
                if (i == fileInput.length - 1) {
                    const rake = new RAKE();
                    rake.extractTopKw(kwe.getFullContent(), 
                        maxKwLength === ''? 3 : maxKwLength, 
                        prioritizeNounAdj === undefined? false : prioritizeNounAdj).then(wdres => {
                        console.log(wdres);
                        setKeywords(wdres);
                        setIsReadingFile(false);
                    });
                }
            });
        }
}

    const updatePathInput = (path) => {
        document.getElementById('path').value = path;
    }

    const handleSubmit = (e) => {
        const fileInput = document.getElementById('input').files;
        const addressTo = document.getElementById('addressTo')?.value;
        const comment = document.getElementById("comment").value;
        var path = document.getElementById("path").value.replaceAll('\\', '/').replace(/([^:]\/)\/+/g, "$1");;
        const localPin = document.getElementById("pin").checked;
        e.preventDefault();
        
        console.log(sharingMode);
        //form validation
        if (fileInput.length == 0 || sharingMode && !addressTo) {
            if (sharingMode)
                return alert(strs.Form_validate_addrfile);
            else
                return alert(strs.Form_validate_file);
        }

        //path processing
        while (path[path.length - 1] === '/')
            path = path.slice(0, -1);

        while (path[0] === '/')
            path = path.substring(1);

        setIsLoading(true);
        shareFile(localPin, currentAccount, sharingMode? addressTo : currentAccount, fileInput, comment, path, setProgressMsg).finally(() => setIsLoading(false));
    }

    useEffect(() => {
        if (formSuggestPath.length > 0) {
            document.getElementById('path').value = formSuggestPath;
            addSuggestionPath('');
        }
    }, [formSuggestPath]);

    return (
        <div className='py-2'>
            <p><input type='checkbox' id='sharingMode' onChange={updateSharing} /> Share to someone</p>
            <p><input type='checkbox' id='pin' /> Just pin my files locally</p>
            
            <input type='file' disabled={isReadingFile? true : false} id='input' className='text-white' multiple />
            
            {sharingMode && <Input placeholder="Address To" name="addressTo" type="text" id="addressTo" />}

            <Input placeholder="Comment (optional)" name="comment" type="text" id="comment" />
            <div className='flex'>
                <Input placeholder="Path (e.g.: some/dir/path)" name="path" type="text" id="path" />
                <button className='text-xl' onClick={updateMatch}>🔎</button>
            </div>

            {matchPaths.length > 0 && 'Suggestions from current file list:'}
            {matchPaths.map((path, index) => (
                <div key={index}><button className='text-yellow-300' onClick={() => updatePathInput(path)}>{path}</button></div>
            ))}
            {matchPaths.length > 0 && <div className='h-[1px] w-full bg-gray-400 my-2' />}

            <div className='flex'>
                <h2>Want path suggestions?</h2>
                <button className='text-xl' onClick={()=> alert(strs.Path_Suggestion_How)}>ℹ</button>
                
            </div>
            <div className='flex'>
                <h2>At most</h2>
                <input className='w-9 mx-2 pl-1 text-gray-700 rounded-md' min='1' max='10' placeholder='3' type='number' id='kwlength'/> 
                <h2>words</h2>
                <button className='mx-1 text-xl' onClick={updateKeyword}>💡</button>
            </div>
            
            {isReadingFile != '' && <h2 className='text-purple-400 font-bold'>Processing, please wait...</h2>}

            {keyWords.length > 0 && 
            <div>
                <h2>Sorted based on the relevancy:</h2>
                <p><input type='checkbox' id='priorit' onChange={updateKeyword} /> Prioritize noun/adjectives</p>
                <div className="h-64 overflow-y-scroll scrollbar-thumb-gray-500 scrollbar-track-gray-200">
                    {keyWords.map((wd, index) => (
                        <div key={index}><button className='text-yellow-300' title={'RAKE score: ' + wd[1]} onClick={() => updatePathInput(wd[0])}>{index+1}. {wd[0]}</button></div>
                    ))}
                </div>
            </div>}
            
            <div className='h-[1px] w-full bg-gray-400 my-2' />
            {isLoading && <br />}{progressMsg}{isLoading && <br />}

            {currentAccount && isLoading ? (
                <Loader />
            ) : (
                <button
                    type="button"
                    onClick={handleSubmit}
                    className="text-white w-full mt-2 border-[1px] p-2 border-white rounded-full cursor-pointer">
                    {sharingMode? <>Share</> : <>Store</>}
                </button>
            )}
        </div>
    );
}

export { FileForm };