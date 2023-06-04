import HTTPRequest from "./HTTPRequest";
import LevenshteinDist from "./LevenshteinDist";

class VersionComparator {

    constructor() {
        this.textExt = {};
        this.result = {
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
        };

        const tmpExt = [
            ".txt",
            ".md",
            ".html",
            ".css",
            ".js",
            ".jsx",
            ".ts",
            ".tsx",
            ".json",
            ".xml",
            ".bat",
            ".yaml",
            ".csv",
            ".log",
            ".cfg",
            ".ini",
            ".sql",
            ".py",
            ".rb",
            ".java",
            ".c",
            ".cpp",
            ".h",
            ".hpp",
            ".cs",
            ".php",
            ".go",
            ".sh",
            ".bat",
            ".ps1",
            ".psm1",
            ".r"
        ];

        for (let i = 0; i < tmpExt.length; i++)
            this.textExt[tmpExt[i]] = true;

    }

    async remoteCIDFileMap(rootCID) {
        // web crwaling
        const req = new HTTPRequest(`https://${rootCID}.ipfs.nftstorage.link`, 'GET');
        const resMap = {};
        try {
            var reply = await req.sendAwait();
            reply = reply.split(/\r?\n/);

            for (let i = 0; i < reply.length; i++) {
                const comp = reply[i].split('?filename=');
                if (comp.length === 2) {
                    const CIDinfo = comp[0];
                    const filename = comp[1].slice(0, -2);
                    resMap[filename] = CIDinfo;
                }
            }
        } catch (error) {
            alert("Failed to fetch the files' CID data. Unable to compare file contents.");
        }
        
        return resMap;
    }

    async compareEdit(oldFileURL, newFileURL, oldFileObj, newFileObj) {
        const reqOld = new HTTPRequest(oldFileURL, 'GET');
        const reqNew = new HTTPRequest(newFileURL, 'GET');

        try {
            var oldText, newText;

            await reqOld.sendAwait().then(cont => {
                oldText = cont;
            });

            await reqNew.sendAwait().then(cont => {
                newText = cont;
            });

            const ops = new LevenshteinDist(oldText, newText);
            this.result.textModifications.push({ oldFile: oldFileObj, newFile: newFileObj, ops: ops.compute() });

        } catch (error) {
            console.error(error);
            this.result.errors.push({ oldFile: oldFileObj, newFile: newFileObj, error: error.toString() });
        }
    }

    async compare(oldVer, newVer, isLocalPin, progressSetter) {
        const nFileList = newVer.file;
        const oFileList = oldVer.file;
        const oFileMap = {};
        const nFileMap = {};

        for (let i = 0; i < oFileList.length; i++) {
            oFileMap[oFileList[i].name] = oFileList[i];
        }

        for (let i = 0; i < nFileList.length; i++) {
            nFileMap[nFileList[i].name] = nFileList[i];
        }

        // file name changes
        for (let i = 0; i < oFileList.length; i++) {
            if (!nFileMap[oFileList[i].name]) {
                this.result.nameChanges.deleted.push(oFileList[i]);
                this.result.nameChanges.delMap[oFileList[i].name] = true;
            }
        }

        for (let i = 0; i < nFileList.length; i++) {
            if (!oFileMap[nFileList[i].name]) {
                this.result.nameChanges.added.push(nFileList[i]);
                this.result.nameChanges.addMap[nFileList[i].name] = true;
            }
        }


        // code changes, other changes
        const oldRemoteCID = oldVer.cid;
        const newRemoteCID = newVer.cid;
        progressSetter('Getting CID...');
        const oldRemoteChildCID = isLocalPin? undefined : await this.remoteCIDFileMap(oldRemoteCID);
        const newRemoteChildCID = isLocalPin? undefined : await this.remoteCIDFileMap(newRemoteCID);
        if (!isLocalPin && (!oldRemoteChildCID || !newRemoteChildCID))
            return this.result;

        progressSetter('Downloading...');
        for (let i = 0; i < nFileList.length; i++) {
            const fname = nFileList[i].name; // file name
            const fileComp = fname.split('.');
            const fext = '.' + fileComp[fileComp.length - 1]; //file ext
            const fsizeKB = parseFloat(nFileList[i].size); // file size
            const fsizeKB_old = parseFloat(oFileMap[fname]?.size);

            if (isLocalPin) {
                const cid = nFileList[i].cid;

                // Having same name in old version but contents are different
                if (oFileMap[fname] && cid !== oFileMap[fname].cid) {
                    // reduce unnecessary web requests
                    if (this.textExt[fext] && fsizeKB < 500 && fsizeKB_old < 500) {
                        await this.compareEdit(`http://${oFileMap[fname].cid}.ipfs.localhost:8080/`,
                            `http://${nFileList[i].cid}.ipfs.localhost:8080/`, oFileMap[fname], nFileList[i]);
                    } else {
                        this.result.unprocessedChanges.push({ oldFile: oFileMap[fname], newFile: nFileList[i] });
                    }
                    this.result.modMap[fname] = true;
                } 
            } else if (oFileMap[fname] && oldRemoteChildCID[fname] !== newRemoteChildCID[fname]) {
                if (this.textExt[fext] && fsizeKB < 500 && fsizeKB_old < 500) {
                    await this.compareEdit(`https://${oldRemoteCID}.ipfs.nftstorage.link/${fname}`,
                        `https://${newRemoteCID}.ipfs.nftstorage.link/${fname}`, oFileMap[fname], nFileList[i]);
                } else {
                    this.result.unprocessedChanges.push({ oldFile: oFileMap[fname], newFile: nFileList[i] });
                }
                this.result.modMap[fname] = true;
            }
        }

        progressSetter('');
        return this.result;
            
    }

}

export default VersionComparator;