import React from 'react';
import FilesContent from './FilesContent'
import {withRouter} from 'react-router-dom'
function FileExplorer({match:{params}}){
    return <FilesContent datasetId={params.datasetId} />
}

export default withRouter( FileExplorer);