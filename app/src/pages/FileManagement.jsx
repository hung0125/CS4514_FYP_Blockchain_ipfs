import React, {useContext, useState} from 'react';
import Navbar from './components/general/Navbar';
import { Footer, FilePanel } from '.';
import FileExplorer from './components/FileManagement/FileExplorer';

const FileManagement = () => {
    return (
        <div id='fileManagementBody' className='bg-[#002B5B] text-white'>
            <Navbar/>
            <FilePanel/>
            <FileExplorer/>
            <Footer/>
        </div>
        
    );

}

export default FileManagement

