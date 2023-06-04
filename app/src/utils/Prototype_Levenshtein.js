// test case: https://poe.com/s/eEZs89v0kbYQY0WtCYlm

const newtext = 'cbaba';
const oldtext = 'cabba';
// const newtext = 'aabcbabcc';
// const oldtext = 'bacccaabc';

var costMat = new Array(newtext.length+1).fill().map(() => new Array(oldtext.length+1).fill(0));
var srcMat = [];
for (let r = 0; r <= newtext.length; r++) {
    srcMat.push([]);
    for (let c = 0; c <= oldtext.length; c++) {
        srcMat[r].push([-1, -1]);
    }
}
var eqMap = {};

for (let r = 0; r <= newtext.length; r++) {
    for (let c = 0; c <= oldtext.length; c++) {
            
        if (r == 0 || c == 0) {
            costMat[r][c] = r == 0? c : r;
            
            // update source
            if (r > 0 && c == 0) {
                srcMat[r][c] = [r-1, 0];
            }else if (r == 0 && c > 0) {
                srcMat[r][c] = [0, c-1];
            }
            
        }else if (newtext[r-1] == oldtext[c-1]){ // diagonal grid (upper left) match
            eqMap[`${r-1},${c-1}`] = true;
            var minCost = Math.min(
                costMat[r-1][c] + 1, //upper
                costMat[r-1][c-1], //diagonal
                costMat[r][c-1] + 1 //left
            );
            costMat[r][c] = minCost;
            
            // update source: vertical -> diagonal -> horizontal
            if (costMat[r-1][c] + 1 == minCost) {
                srcMat[r][c] = [r-1, c];
            }else if (costMat[r][c-1] + 1 == minCost) {
                srcMat[r][c] = [r, c-1];
            }else {
                srcMat[r][c] = [r-1, c-1];
            }
            
        }else {
            var minCost = Math.min(
                costMat[r-1][c] + 1,
                costMat[r][c-1] + 1
            );
            
            costMat[r][c] = minCost;
            
            // update source: vertical -> horizontal
            if (costMat[r-1][c] + 1 == minCost) {
                srcMat[r][c] = [r-1, c];
            }else {
                srcMat[r][c] = [r, c-1];
            }
        }
    }
}

//backtrack
var r = newtext.length, c = oldtext.length, prevR, prevC;
var editpath = [];
var totalOps = 0;
while (r >= 0 && c >= 0) {
    // console.log(r, c);
    
    if (r < newtext.length || c < oldtext.length) {
        if (eqMap[`${r},${c}`] && r + 1 == prevR && c + 1 == prevC) {
            // console.log(`${newtext[r]} = ${oldtext[c]}, keep ${oldtext[c]}\n`);
            editpath.push({op: 'keep', line: oldtext[c]});
        }else if (prevC == c){
            // console.log('+', newtext[r], '\n');
            editpath.push({op:'+', line: newtext[r]});
            totalOps++;
        }else {
            // console.log('-', oldtext[c], '\n');
            editpath.push({op:'-', line: oldtext[c]});
            totalOps++;
        }
    }
    
    var nextR = srcMat[r][c][0];
    var nextC = srcMat[r][c][1];
    prevR = r;
    prevC = c;
    r = nextR;
    c = nextC;
}

    
for (let r = 0; r <= newtext.length; r++) {
    var line = r > 0? "_":'';
    for (let c = 0; c <= oldtext.length; c++) {
        line += `${srcMat[r][c][0]},${srcMat[r][c][1]}\t\t`;
    }
    console.log(line);
}

for (let r = 0; r <= newtext.length; r++) {
    var line = '';
    for (let c = 0; c <= oldtext.length; c++) {
        line += costMat[r][c] + ' ';
    }
    console.log(line);
}

console.log(costMat);
console.log(editpath);
console.log('Ops:', totalOps);