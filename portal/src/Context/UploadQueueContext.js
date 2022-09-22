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