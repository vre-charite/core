import queue from 'async/queue';
import React from 'react';
import {fileUpload} from '../Utility/fileUpload';
const filesConcurrency = 1;

//after fixed
const q = queue(function (task, callback) {
  new Promise((resolve,reject)=>{
    fileUpload(task,resolve,reject);
  }).then(res=>{
    callback();
  }).catch(err=>{
    callback();
  })
}, filesConcurrency);

/* //
 const q = queue(async function (task, callback) {
  await new Promise((resolve,reject)=>{
    fileUpload(task,resolve,reject);
  })
  callback();
}, filesConcurrency);  */




const UploadQueueContext = React.createContext(q);
export {UploadQueueContext,q};