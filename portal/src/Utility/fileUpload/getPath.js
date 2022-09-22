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