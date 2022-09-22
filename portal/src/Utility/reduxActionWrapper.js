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

import {store} from '../Redux/store';

/**
 * convert generic function to action creator&dispatcher
 * @param {function | Array<function>} funcs a function or an Array of function to create an redux action.
 * @returns {function | Array<function>} the action dispatcher
 */
export default function reduxActionWrapper(funcs){
    if(Array.isArray(funcs)){
        return funcs.map(item=>helper(item));
    }else{
        return helper(funcs)
    }
}

function helper(func){
    if(typeof func !=='function'){
        throw new Error('You should pass a function')
    }
    return (actionParams)=>{
        store.dispatch(func(actionParams))
    }
}