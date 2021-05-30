const path = require('path');

exports.pathsMap = (array) => {
  let dirname = path.dirname(array);
  const dirArray = dirname.split('/');
  if (dirname.includes('vre-storage')) {
    if (dirArray.length <= 5) {
      if (dirname.includes('raw')) return 'Green Room/Home';
      if (dirname.includes('TRASH')) return 'Green Room/Trash';
    }

    const baseDir = dirArray.slice(5).join('/');
    if (dirname.includes('raw')) dirname = 'Green Room/Home/' + baseDir;
    if (dirname.includes('TRASH')) dirname = 'Green Room/TRASH/' + baseDir;

    return dirname;
  }

  if (dirArray[1] === 'vre-data') {
    // file-without raw /vre-data/indoctestproject
    // file-with raw /vre-data/indoctestproject/raw
    // folder-without raw /vre-data/indoctestproject/a/b
    // folder-with raw /vre-data/indoctestproject/raw/a/b
    // file-trash /vre-data/TRASH/indoctestproject
    // folder-trash /vre-data/TRASH/indoctestproject/a/b

    if (dirArray[2] === 'TRASH') {
      if (dirArray.length === 4) return 'Trash';
      return 'Trash/' + dirArray.slice(4).join('/');
    }

    if (dirArray[3] === 'raw') {
      dirArray.splice(3, 1);
    }

    if (dirArray.length === 3) return 'Home';
    return 'Home/' + dirArray.slice(3).join('/');
  }
};

exports.pathsMapV2 = (filePath) => {
  let dirname = path.dirname(filePath);
  let filename = path.basename(filePath);

  if (dirname.includes('vre-storage')) {
    const dirArray = dirname.split('/');
    if (dirArray.length <= 5) return filename;

    const baseDir = dirArray.slice(5).join('/');
    return baseDir + '/' + filename;
  }

  if (dirname.includes('vre-data')) {
    const dirArray = dirname.split('/');
    if (dirArray.length <= 4) return filename;

    let baseDir = dirArray.slice(4).join('/');
    return baseDir + '/' + filename;
  }
};

exports.pathNameMap = (array) => {
  if (array.includes('vre-storage') && array.includes('raw'))
    return 'Green Room File';

  if (array.includes('vre-data') && !array.includes('TRASH'))
    return 'Core File';

  if (array.includes('vre-data') && array.includes('TRASH'))
    return 'Core Trash File';

  if (array.includes('vre-storage') && array.includes('TRASH'))
    return 'Green Room Trash File';
};

exports.locationMap = (pathString) => {
  let dirname = path.dirname(pathString);
  const dirArray = dirname.split('/');
  if (dirArray[2] === 'vre-storage') {
    if (dirArray.length <= 5) {
      if (dirname.includes('raw')) return 'Home';
      if (dirname.includes('TRASH')) return 'Trash';
    }

    const baseDir = dirArray.slice(5).join('/');
    if (dirname.includes('raw')) dirname = 'Home/' + baseDir;
    if (dirname.includes('TRASH')) dirname = 'TRASH/' + baseDir;

    return dirname;
  }

  if (dirArray[1] === 'vre-data') {
    // file-without raw /vre-data/indoctestproject
    // file-with raw /vre-data/indoctestproject/raw
    // folder-without raw /vre-data/indoctestproject/a/b
    // folder-with raw /vre-data/indoctestproject/raw/a/b
    // file-trash /vre-data/TRASH/indoctestproject
    // folder-trash /vre-data/TRASH/indoctestproject/a/b

    if (dirArray[2] === 'TRASH') {
      if (dirArray.length === 4) return 'Trash';
      return 'Trash/' + dirArray.slice(4).join('/');
    }

    if (dirArray[3] === 'raw') {
      dirArray.splice(3, 1);
    }

    if (dirArray.length === 3) return 'Home';
    return 'Home/' + dirArray.slice(3).join('/');
  }
};
