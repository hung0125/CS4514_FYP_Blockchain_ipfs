import * as pdfjs from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry'

class KeywordExtractor {

    constructor() {
        this.files = [];
        this.readyCount = 0;
        this.validExt = ['pdf', 'txt', 'py'];
        // this.validCodeExt = ['cpp', 'py', 'java', 'js', 'rb', 'c', 'cs', 'php', 'swift', 'kt', 'scala', 'go', 'dart', 'ts', 'html', 'css', 'h', 'r'];
        this.content = [];
    }

    isReady() {
        return this.readyCount === this.files.length;
    }

    fileToUint8Array(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function () {
                const arrayBuffer = reader.result;
                const uint8Array = new Uint8Array(arrayBuffer);
                resolve(uint8Array);
            };
            reader.onerror = function () {
                reject(reader.error);
            };
            reader.readAsArrayBuffer(file);
        });
    }

    textFromTXT(fileObj) {
        return new Promise((resolve, reject) => {
            const txtReader = new FileReader();
            txtReader.readAsText(fileObj);
            txtReader.onload = () => {
                resolve(txtReader.result.replace(/\n/g, ''));
            };
            txtReader.onerror = () => {
                reject(txtReader.error);
            };
        });
    }

    async textFromPDF(fileObj) {
        pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
        const u8arr = await this.fileToUint8Array(fileObj);
        const pdf = await pdfjs.getDocument(u8arr).promise;

        const numPages = pdf.numPages;
        let text = '';
        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(' ');
        }
        return text;
    }

    async tryAddFile(fileObj) {
        var comp = fileObj.name.split('.');
        var ext = comp[comp.length - 1].toLowerCase();
        var isDocument = this.validExt.some(extension => extension === ext)

        if (isDocument) {
            this.readyCount++;
            this.files.push(fileObj);

            try {
                switch (ext) {
                    case 'pdf':
                        this.content.push(await this.textFromPDF(fileObj));
                        break;

                    case 'txt':
                        this.content.push(await this.textFromTXT(fileObj));
                        break;
                }
            } catch (error) {
                console.error(error);
            }

        }

    }

    getFullContent() {
        return this.content.join('||');
    }

}

export default KeywordExtractor;