import { saveAs } from 'file-saver';
import JSZipUtils from 'jszip-utils'
import JSZip from 'jszip';

class BatchDownloader {
    constructor() {

    }

    async download(urls, filenames, progressSetter, buttonToggler) {
        //progressSetter can be empty, optional
        const zip = new JSZip();
        var count = 0;

        try {
            urls.forEach(function (url, i) {
                // loading a file and add it in a zip file
                JSZipUtils.getBinaryContent(url, (function (filename, index) {
                    return function (err, data) {
                        if (err) {
                            alert(`Skipped ${filename}, reason: ${err}`);
                        }
                        zip.file(filename, data, { binary: true });
            
                        count++;
                        if(progressSetter) progressSetter(`... ${count}/${urls.length} files`);
                        if (count == urls.length) {
                            zip.generateAsync({ type: 'blob' }).then(function (content) {
                                if(progressSetter) progressSetter(null);
                                if(buttonToggler) buttonToggler(false);
                                saveAs(content, `Download-${Date.now().toString()}.zip`);
                            });
                        }
                    }
                })(filenames[i], i));
            });
        }catch(err) {
            if(progressSetter) progressSetter(null);
            alert(err);
        }
    }
}

export default BatchDownloader;