import { createContext } from 'react';

const FileExplorerStateContext = createContext();

const ExplorerStateProvider = FileExplorerStateContext.Provider;

export { ExplorerStateProvider,FileExplorerStateContext };
