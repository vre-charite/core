import { message } from 'antd'
const { objectKeysToCamelCase } = require("./caseConvert");

const errorTable = { 'example001': ({ data, params, url }) => { message.error(`the project ${params.projectId} doesn't exist`) } }


function errorMessage(res) {
    const { config, data: snakeData } = res;
    const data = objectKeysToCamelCase(snakeData);
    if (data.errorCode !== 0) {
        console.log(data.errorMessage, 'the error message of the response');
        const handleFunc = errorTable[errorCode];
        handleFunc(config);
    }
    return res;
}

export {errorMessage};

