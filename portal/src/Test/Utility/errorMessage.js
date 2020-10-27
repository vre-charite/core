/**
 * take screen shot when there is an error message excepts file already exist
 * @param {*} getPage 
 * @param {(msg:ConsoleMessage)=>void} callback the callback that when the first console.log msg param is 'error message logging'
 */
function catchErrorMessage(getPage, callback) {
    const page = getPage();
    page.on('console', msg => {
        if (msg.args()[0] === 'error message logging') {
            callback(msg);
        }
    });
}

module.exports = {catchErrorMessage}