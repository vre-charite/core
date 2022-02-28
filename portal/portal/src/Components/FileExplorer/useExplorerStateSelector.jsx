import {useContext} from 'react';
import {FileExplorerStateContext} from './FileExplorerStateContext'
function useExplorerStateSelector(selector){
    const state = useContext(FileExplorerStateContext);
    if(!state){
        throw new Error('Using useExplorerStateSelector hook without a provider')
    };
    return selector(state);
}