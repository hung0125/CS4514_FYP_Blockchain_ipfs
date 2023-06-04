import nlp from 'compromise'

class RAKE {
    constructor() { }

    splitText(text) {
        text = text.trim();
        var res = [];
        var portion = '';
        for (let i = 0; i < text.length; i++) {
            var code = text[i].charCodeAt(0);
            if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122) || text[i] === '-' || text[i] === "'") {
                portion += text[i];
            } else if (text[i] === ' ') {
                if (portion.length > 0)
                    res.push(portion);
                portion = '';
            } else {
                res.push(portion);
                portion = '';
                res.push(text[i]);
            }
        }

        if (portion.length > 0)
            res.push(portion);

        return res;
    }

    isNounsOrAdjsOrUnknown(str) {
        const nouns = nlp(str).nouns().out('array');
        const adjs = nlp(str).adjectives().out('array');
        const tags = nlp(str).terms().map(term => {
            if (term.tags && term.tags.length > 0) {
                return term.tags[0];
            }
            return undefined;
        });
        return nouns.length > 0 || adjs.length > 0 || tags.some(tag => tag === undefined);
    }

    async extractTopKw(text, maxKwLength, prioNounAdj) {
        // Step 1: Preprocess the text
        // stopwords: https://github.com/csurfer/rake-nltk/blob/a80f633098dba19c409cb1778206189d8573696a/docs/_build/html/_static/language_data.js#L13
        // robustness test: https://monkeylearn.com/keyword-extraction/
        // const stopWords = ['is', 'not', 'that', 'there', 'are', 'can', 'you', 'with', 'of', 'those', 'after', 'all', 'one'];
        // const stopWords = ["has", "been", "than", "a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "if", "in", "into", "is", "it", "near", "no", "not", "of", "on", "or", "such", "that", "the", "their", "then", "there", "these", "they", "this", "to", "was", "will", "with"];
        const stopWords = [
            "a", "able", "about", "across", "after",  "all", "almost", "also","am","among",
            "an","and","any","are",  "as",  "at", "be","because","been", "but", "by",  
            "can", "cannot", "could", "dear","did",  "do", "does", "either","else",  
            "ever", "every", "for", "from","get", "got",  "had", "has", "have", "he",
            "her", "hers", "him", "his", "how", "however","i","if","in","into","is", 
            "it", "its", "just", "least","let",  "like", "likely","may", "me", "might",  
            "most", "must", "my", "neither", "no",  "nor", "not", "of", "off", "often",
            "on", "only", "or","other",  "our",  "own","rather", "said", "say", "says",  
            "she", "should", "since", "so", "some","than", "that", "the", "their","them",
            "then", "there", "these",  "they",  "this", "tis", "to", "too", "twas",
            "us","wants", "was", "we", "were", "what", "when", "where","which","while", 
            "who",  "whom", "why",  "will",  "with","would","yet", "you", "your"
        ];
        const textSplit = this.splitText(text.toLowerCase());
        const cleanText = textSplit.filter(word => !stopWords.includes(word));
        // console.log('Cleaned text:')
        // console.log(cleanText);

        // Step 2: Split the text into unique words
        const wmap = new Map();
        const uwords = [];

        for (let i = 0; i < cleanText.length; i++) {
            if (/[A-Za-z]/.test(cleanText[i]) && !wmap.has(cleanText[i])) {
                wmap.set(cleanText[i], true);
                uwords.push(cleanText[i]);
            }
        }
        // console.log('Unique words: ')
        // console.log(uwords);

        // Step 3: phrases: split by non-english char and stopwords  
        const phrases = [];
        var tmpPh = [];
        for (let i = 0; i < textSplit.length; i++) {
            if (wmap.has(textSplit[i]))
                tmpPh.push(textSplit[i]);
            else if (tmpPh.length > 0) {
                phrases.push(tmpPh);
                tmpPh = [];
            }
        }
        if (tmpPh.length > 0) {
            phrases.push(tmpPh);
            tmpPh = [];
        }

        // console.log('Phrases');
        // console.log(phrases);

        // Step 4: Matrix --> degree score --> combination discovery and results (run in background)
        const myWorker = new Worker('src/utils/multithread_workers/RakeWorker.js');
        myWorker.postMessage({uwords: uwords, phrases:phrases});

        return new Promise((resolve, reject) => {
            myWorker.onmessage = (response) => {
                const degScore = response.data;

                const results = [];
                const kwDict = {};
            
                for (let i = 0; i < phrases.length; i++) {
                    for (let j = 0; j < Math.max(phrases[i].length - (maxKwLength + 1), 1); j++) {
                        var scr = 0;
                        var kw = '';
            
                        var numWds = 0;
                        var numNounAdjUnknown = 0;
                        for (let k = j; k < Math.min(j + maxKwLength, phrases[i].length); k++) {
                            numWds++;
                            if (k > j) kw += ' ';
                            kw += phrases[i][k];
                            scr += degScore[phrases[i][k]];
            
                            if (prioNounAdj && this.isNounsOrAdjsOrUnknown(phrases[i][k]))
                                numNounAdjUnknown++;
                        }
            
                        if (kwDict[kw] === undefined) {
                            kwDict[kw] = scr;
                            results.push([kw, scr, numNounAdjUnknown, numWds]);
                        }
                    }
                }
            
                if (prioNounAdj)
                    resolve(results.sort((a, b) => b[1] * b[2] / b[3] - a[1] * a[2] / a[3]));
                else
                    resolve(results.sort((a, b) => b[1] - a[1]));
            };

            myWorker.onerror = (error) => {
                reject(error);
            };
        });

    }
}

export default RAKE;