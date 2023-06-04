class DataUtils {

    constructor() { }

    makeMutableArray(readOnlyArray) {
        if (readOnlyArray.length == 0)
            return [];
        var keys = Object.keys(readOnlyArray[0]);
        //console.log(keys);

        var arr = [];
        for (var i = 0; i < readOnlyArray.length; i++) {
            var obj = [];
            keys.forEach((item) => obj[item] = readOnlyArray[i][item]);
            arr.push(obj);
        }
        return arr;
    }

}

export default DataUtils;