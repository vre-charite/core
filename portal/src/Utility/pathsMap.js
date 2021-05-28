const path = require('path');

exports.pathsMap = (array) => {
  let dirname = path.dirname(array);

  if (dirname.includes('vre-storage')) {
    const dirArray = dirname.split('/');
    if (dirArray.length <= 5) {
      if (dirname.includes('raw')) return 'Green Room/Home';
      if (dirname.includes('TRASH')) return 'Green Room/Trash';
    }

    const baseDir = dirArray.slice(5).join('/')
    if (dirname.includes('raw')) dirname = 'Green Room/Home/' + baseDir;
    if (dirname.includes('TRASH')) dirname = 'Green Room/TRASH/' + baseDir;

    return dirname;
  }

  if (dirname.includes('vre-data')) {
    const dirArray = dirname.split('/');
    if (dirArray.length <= 3) {
      if (dirname.includes('TRASH')) return 'Core/Trash';
      return 'Core/Home';
    }

    let baseDir = dirArray.slice(3).join('/')
    if (dirname.includes('raw')) {
      dirname = 'Core/Home/' + baseDir;
    } else if (dirname.includes('TRASH')) {
      dirname = 'Core/TRASH/' + baseDir;
    } else {
      baseDir = dirArray.slice(3).join('/')
      dirname = 'Core/Home/' + baseDir;
    }

    return dirname;
  }
};

exports.pathsMapV2 = (filePath) => {
  let dirname = path.dirname(filePath);
  let filename = path.basename(filePath);

  if (dirname.includes('vre-storage')) {
    const dirArray = dirname.split('/');
    if (dirArray.length <= 5) return filename

    const baseDir = dirArray.slice(5).join('/')
    return baseDir + '/' + filename;
  }

  if (dirname.includes('vre-data')) {
    const dirArray = dirname.split('/');
    if (dirArray.length <= 4) return filename

    let baseDir = dirArray.slice(4).join('/')
    return baseDir + '/' + filename;
  }
}

exports.pathNameMap = (array) => {

  if (array.includes('vre-storage') && array.includes('raw'))
    return 'Green Room File';

  if (array.includes('vre-data') && !array.includes('TRASH')) return 'Core File';

  if (array.includes('vre-data') && array.includes('TRASH'))
    return 'Core Trash File';

  if (array.includes('vre-storage') && array.includes('TRASH'))
    return 'Green Room Trash File';
};

exports.locationMap = (array) => {
  let dirname = path.dirname(array);

  if (dirname.includes('vre-storage')) {
    const dirArray = dirname.split('/');
    if (dirArray.length <= 5) {
      if (dirname.includes('raw')) return 'Home';
      if (dirname.includes('TRASH')) return 'Trash';
    }

    const baseDir = dirArray.slice(5).join('/')
    if (dirname.includes('raw')) dirname = 'Home/' + baseDir;
    if (dirname.includes('TRASH')) dirname = 'TRASH/' + baseDir;

    return dirname;
  }

  if (dirname.includes('vre-data')) {
    const dirArray = dirname.split('/');
    if (dirArray.length <= 3) {
      if (dirname.includes('TRASH')) return 'Trash';
      return 'Home';
    }

    let baseDir = dirArray.slice(3).join('/')
    if (dirname.includes('raw')) {
      dirname = 'Home/' + baseDir;
    } else if (dirname.includes('TRASH')) {
      dirname = 'TRASH/' + baseDir;
    } else {
      baseDir = dirArray.slice(3).join('/')
      dirname = 'Home/' + baseDir;
    }

    return dirname;
  }
};
