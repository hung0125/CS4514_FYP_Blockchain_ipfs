const cOccurrenceMatrix = (words, phrases) => {
    const start = new Date().getTime();
    const wordIndices = {};
    const n = words.length;
    for (let i = 0; i < n; i++) {
        wordIndices[words[i]] = i;
    }

    const occMatrix = Array.from({ length: n }, () =>
        Array.from({ length: n }, () => 0)
    );

    // traverse phrases first
    for (let i = 0; i < phrases.length; i++) {
        const phrase = phrases[i];
        // Each counts the occurence for each word with a phrase
        const wordCounts = Array.from({ length: n }, () => 0);

        for (let j = 0; j < phrase.length; j++) {
            const wordIndex = wordIndices[phrase[j]];
            wordCounts[wordIndex]++;
        }

        // modify matrix
        for (let r = 0; r < n; r++) {
            occMatrix[r][r] += wordCounts[r] * wordCounts[r];

            for (let c = r + 1; c < n; c++) {
                const count = wordCounts[r] * wordCounts[c];
                if (count > 0) {
                    occMatrix[r][c] += count;
                    occMatrix[c][r] = occMatrix[r][c];
                }
            }
        }
    }
    // console.log('OccurenceMatrix: ');
    // console.log(occMatrix);
    return occMatrix;
}

const wordScoreList = (words, matrix) => {
    var scrDict = {};

    for (let r = 0; r < words.length; r++) {
        var cnt = 0;
        const row = matrix[r];
        const colIdx = Object.keys(row);
        for (let c = 0; c < colIdx.length; c++) {
            const col = colIdx[c];
            cnt += matrix[r][col];
        }
        scrDict[words[r]] = cnt / matrix[r][r];
    }

    return scrDict;
}

self.onmessage = function(event) {
    const phrases = event.data.phrases;
    const uwords = event.data.uwords;

    const mat = cOccurrenceMatrix(uwords, phrases);
    const degScore = wordScoreList(uwords, mat);

   postMessage(degScore);

};