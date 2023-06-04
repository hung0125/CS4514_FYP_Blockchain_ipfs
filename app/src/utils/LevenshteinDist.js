class LevenshteinDist {
    constructor(oldcontent, newcontent) {
        this.oldc = oldcontent.split(/\r?\n/);
        this.newc = newcontent.split(/\r?\n/);
    }

    compute() {
        var costMat = new Array(this.newc.length + 1).fill().map(() => new Array(this.oldc.length + 1).fill(0));
        var srcMat = [];
        for (let r = 0; r <= this.newc.length; r++) {
            srcMat.push([]);
            for (let c = 0; c <= this.oldc.length; c++) {
                srcMat[r].push([-1, -1]);
            }
        }
        var eqMap = {};

        for (let r = 0; r <= this.newc.length; r++) {
            for (let c = 0; c <= this.oldc.length; c++) {

                if (r == 0 || c == 0) {
                    costMat[r][c] = r == 0 ? c : r;

                    // update source
                    if (r > 0 && c == 0) {
                        srcMat[r][c] = [r - 1, 0];
                    } else if (r == 0 && c > 0) {
                        srcMat[r][c] = [0, c - 1];
                    }

                } else if (this.newc[r - 1] == this.oldc[c - 1]) { // diagonal grid (upper left) match
                    eqMap[`${r - 1},${c - 1}`] = true;
                    var minCost = Math.min(
                        costMat[r - 1][c] + 1, //upper
                        costMat[r - 1][c - 1], //diagonal
                        costMat[r][c - 1] + 1 //left
                    );

                    costMat[r][c] = minCost;

                    // update source: vertical -> horizontal -> diagonal
                    if (costMat[r - 1][c] + 1 == minCost) {
                        srcMat[r][c] = [r - 1, c];
                    } else if (costMat[r][c - 1] + 1 == minCost) {
                        srcMat[r][c] = [r, c - 1];
                    } else {
                        srcMat[r][c] = [r - 1, c - 1];
                    }

                } else {
                    var minCost = Math.min(
                        costMat[r - 1][c] + 1,
                        costMat[r][c - 1] + 1
                    );

                    costMat[r][c] = minCost;

                    // update source: vertical -> horizontal
                    if (costMat[r - 1][c] + 1 == minCost) {
                        srcMat[r][c] = [r - 1, c];
                    } else {
                        srcMat[r][c] = [r, c - 1];
                    }
                }
            }
        }

        //backtrack
        var r = this.newc.length, c = this.oldc.length, prevR, prevC;
        var editpath = [];
        while (r >= 0 && c >= 0) {
            // console.log(r, c);

            if (r < this.newc.length || c < this.oldc.length) {
                if (eqMap[`${r},${c}`] && r + 1 == prevR && c + 1 == prevC) {
                    editpath.push({ op: '', line: {old: c + 1, new: r + 1}, text: this.oldc[c] });
                } else if (prevC == c) {
                    editpath.push({ op: '+', line: r + 1, text: this.newc[r] });
                } else {
                    editpath.push({ op: '-', line: c + 1, text: this.oldc[c] });
                }
            }

            var nextR = srcMat[r][c][0];
            var nextC = srcMat[r][c][1];
            prevR = r;
            prevC = c;
            r = nextR;
            c = nextC;
        }

        //clean unnecessary lines
        var keepCount = 3;
        var result = [];
        for (let i = editpath.length - 1; i > -1; i--) {
            if (editpath[Math.max(i - 3, 0)].op || editpath[i].op) {
                keepCount = 0;
                result.push(editpath[i]);
            }else if (keepCount < 3) {
                result.push(editpath[i]);
                keepCount++;
            }
        }

        return result;
    }
}

export default LevenshteinDist;