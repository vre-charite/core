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

import React, { useState, useEffect,useReducer,useMemo } from 'react'
import {initStates} from './initStates';
import {explorerReducer,actions} from './reducers'

function useFileExplorer(){
    const [state,dispatch] = useReducer(explorerReducer,initStates);

    //https://stackoverflow.com/questions/59200785/react-usereducer-how-to-combine-multiple-reducers/61439698#61439698
    const memoState = useMemo(() => state, [state])
    const dataFetcher = {
        //
    }
    return [memoState,dataFetcher];
}