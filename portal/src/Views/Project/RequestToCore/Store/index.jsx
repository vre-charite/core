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