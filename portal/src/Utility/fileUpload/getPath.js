/**
 * return empty for multi files upload. return path to file for folder upload(no starting and ending /, no filename`)
 * @param {string} path 
 */
export const getPath = (path) => {
    if (path === "") {
        return path
    };
    const pathArr = path.split('/');
    const pathArrSliced = pathArr.slice(0, pathArr.length - 1);
    return pathArrSliced.join('/');
}