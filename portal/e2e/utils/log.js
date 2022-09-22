// Copyright 2022 Indoc Research
// 
// Licensed under the EUPL, Version 1.2 or – as soon they
// will be approved by the European Commission - subsequent
// versions of the EUPL (the "Licence");
// You may not use this work except in compliance with the
// Licence.
// You may obtain a copy of the Licence at:
// 
// https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
// 
// Unless required by applicable law or agreed to in
// writing, software distributed under the Licence is
// distributed on an "AS IS" basis,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
// express or implied.
// See the Licence for the specific language governing
// permissions and limitations under the Licence.
// 

const logFolderBase = './src/Test/Log';
const path = require('path');
const fs = require('fs');
const pino = require('pino');

function reduxLog(moduleName) {
    const logFolder = path.resolve(logFolderBase, moduleName);
    if (!fs.existsSync(logFolder)) {
        fs.mkdirSync(logFolder, { recursive: true });
    };
    const reduxLogPath = path.resolve(logFolder, 'redux.log');
    fs.openSync(reduxLogPath, 'w');
    const fileLogger = require('pino')(pino.destination(reduxLogPath));
    return (state) => {
        fileLogger.info(state);
    }
}

function screenShot(getPage, moduleName) {
    const page = getPage();
    const screenShotFolder = path.resolve(logFolderBase, moduleName, 'screenShot');
    if (!fs.existsSync(screenShotFolder)) {
        fs.mkdirSync(screenShotFolder, { recursive: true });
    } else {
        fs.readdir(screenShotFolder, (err, files) => {
            if (err) throw err;
            for (const file of files) {
                fs.unlink(path.join(screenShotFolder, file), err => {
                    if (err) throw err;
                });
            }
        });
    };
    return (fileName) => {
        page.screenshot({
            path: path.resolve(screenShotFolder, fileName + '.png')
        })
    }
}


function apiLog(moduleName) {
    const logFolder = path.resolve(logFolderBase, moduleName);
    if (!fs.existsSync(logFolder)) {
        fs.mkdirSync(logFolder, { recursive: true });
    };
    const apiLogPath = path.resolve(logFolder, 'api.log');
    fs.openSync(apiLogPath, 'w');
    const fileLogger = require('pino')(pino.destination(apiLogPath));
    return (info) => {
        fileLogger.info(info);
    }
}

module.exports = { reduxLog, screenShot, apiLog }
