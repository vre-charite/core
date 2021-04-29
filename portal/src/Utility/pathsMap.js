exports.pathsMap = (array) => {
  if (
    array.includes('vre-storage') &&
    array.includes('processed') &&
    array.includes('dicom_edit')
  )
    return 'Green Room/Home';

  if (
    array.includes('vre-storage') &&
    array.includes('processed') &&
    array.includes('straight_copy')
  )
    return 'Green Room/Home';

  if (array.includes('vre-storage') && array.includes('processed'))
    return 'Green Room/Home';

  if (array.includes('vre-storage') && array.includes('raw'))
    return 'Green Room/Home';

  if (array.includes('vre-data') && array.includes('raw')) return 'Core/Home';

  if (array.includes('vre-data') && array.includes('TRASH')) return 'Trash';

  if (array.includes('vre-storage') && array.includes('TRASH')) return 'TRASH';
};

exports.pathNameMap = (array) => {
  if (
    array.includes('vre-storage') &&
    array.includes('processed') &&
    array.includes('dicom_edit')
  )
    return 'Green Room File';

  if (
    array.includes('vre-storage') &&
    array.includes('processed') &&
    array.includes('straight_copy')
  )
    return 'Green Room File';

  if (array.includes('vre-storage') && array.includes('processed'))
    return 'Green Room File';

  if (array.includes('vre-storage') && array.includes('raw'))
    return 'Green Room File';

  if (array.includes('vre-data') && array.includes('raw')) return 'Core File';

  if (array.includes('vre-data') && array.includes('TRASH'))
    return 'Core Trash File';

  if (array.includes('vre-storage') && array.includes('TRASH'))
    return 'Green Room Trash File';
};

exports.locationMap = (path, zone) => {
  const array = path.split('/');
  let fileType = 'raw';

  if (
    array.includes('vre-storage') &&
    array.includes('processed') &&
    array.includes('dicom_edit')
  )
    fileType = 'processed';
  if (
    array.includes('vre-storage') &&
    array.includes('processed') &&
    array.includes('straight_copy')
  )
    fileType = 'processed';

  const index = array.indexOf(fileType);
  const subPathArray = array.slice(index + 1);

  let subPath = subPathArray.join('/');

  if (subPath.length > 1) subPath = `/${subPath}`;

  let location = `Home${subPath}`;

  if (zone === 'VRECore') location = `Home${subPath}`;

  return location;
};
