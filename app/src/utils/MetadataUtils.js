class MetadataUtils {
  constructor() { }

  getSize(fileList) {
    var tSize = 0;
    fileList.forEach(f => {
      tSize += parseFloat(f.size);
    });

    if (tSize > 1024)
      return (tSize / 1024).toFixed(2) + ' MB';
    else
      return (tSize).toFixed(2) + ' KB';
  }

  sizeChanged(fileListNew, fileListOld) {
    var tSizeNew = 0, tSizeOld = 0;
    fileListNew.forEach(f => {
      tSizeNew += parseFloat(f.size);
    });

    fileListOld.forEach(f => {
      tSizeOld += parseFloat(f.size);
    });

    var tSizeChange = tSizeNew - tSizeOld;

    if (tSizeChange == 0)
      return "unchanged";
    else if (Math.abs(tSizeChange) > 1024)
      return (tSizeChange > 0 ? '+' : '') + (tSizeChange / 1024).toFixed(2) + ' MB';
    else
      return (tSizeChange > 0 ? '+' : '') + (tSizeChange).toFixed(2) + ' KB';
  }
}

export default MetadataUtils;