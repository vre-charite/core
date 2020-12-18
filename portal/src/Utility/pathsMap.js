exports.pathsMap = (array) => {    
    if (array.includes('vre-storage') && array.includes('processed') && array.includes('dicom_edit')) return 'Green Room/Processed/dicomEdit';

    if (array.includes('vre-storage') && array.includes('processed') && array.includes('straight_copy')) return 'Green Room/Processed/straightCopy';

    if (array.includes('vre-storage') && array.includes('processed')) return 'Green Room/Processed';

    if (array.includes('vre-storage') && array.includes('raw')) return 'Green Room/Raw';

    if (array.includes('vre-data') && array.includes('raw')) return 'Core/Raw';
}