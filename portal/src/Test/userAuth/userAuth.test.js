const pino = require('pino');
const fs = require('fs');
const logFilePath = './src/Test/userAuth/userAuth.log';
const {baseUrl} = require('../config')
fs.openSync(logFilePath, 'w')
const fileLogger = require('pino')(pino.destination(logFilePath))
const {login, logout} = require('../Utility/login');
const {loginWrong}  = require('./loginWrong');
const {autoLogout,refreshModalLogout} = require('./logout');
const { reduxLog, screenShot, apiLog } = require('../Utility/log');
const { catchErrorMessage } = require('../Utility/errorMessage');
const { waitClickRefresh } = require('../Utility/refreshToken');
jest.setTimeout(7*60*1000);

let page;
const moduleName = 'userAuth';
const getPage = ()=>page;
describe('userAuth', () => {
    
    beforeAll(async () => {
        page = await context.newPage();
        await page.goto(baseUrl);
        await page.setViewport({ width: 1366, height: 768 });
        const reduxLogger = reduxLog(moduleName);
        const screenShotLogger = screenShot(getPage, moduleName);
        const apiLogger = apiLog(moduleName);
        page.on('requestfinished', (request) => {
            const info = {
                headers: request.headers(),
                data: request.postData(),
                url: request.url(),
                response: request.response(),
                failure: request.failure(),
            };
            apiLogger(info);
        });
        catchErrorMessage(getPage, (msg) => {
            const reduxState = msg[1];
            reduxLogger(reduxState);
            screenShotLogger(String(Date.now()))
        })
    });
    login(it,getPage,'admin','admin');
    logout(it,'logout',getPage);
    loginWrong(it,'login with wrong password',getPage,'admin','admin1');
    loginWrong(it,'login with uppercase',getPage,'ADMIN','admin');
    login(it,getPage,'admin','admin');
    autoLogout(it,getPage,'logout if no action to refresh modal');
    login(it,getPage,'admin','admin');
    refreshModalLogout(it,getPage,'log out with refresh page button');
});



