const path = require('path');

exports.pathsMap = (pathStr) => {
  let dirname = path.dirname(pathStr);
  const dirArray = dirname.split('/');
  if (dirname.includes('vre-storage')) {
    if (dirArray[3] === 'TRASH') {
      if (dirArray.length === 5) return 'Trash';
      return 'Trash/' + dirArray.slice(5).join('/');
    }

    if (dirArray.length === 4) return 'Green Room';

    const baseDir = dirArray.slice(4).join('/');
    return 'Green Room/' + baseDir;
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

    if (dirArray.length === 3) return 'Core';
    return 'Core/' + dirArray.slice(3).join('/');
  }
};
