import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { BlankPreviewerCard } from './BlankPreviewerCard/BlankPreviewerCard';
import { NotSupportCard } from './NotSupportCard/NotSupportCard';
import { JsonPreviewer } from './JSON/JsonPreviewer/JsonPreviewer';
import { CsvPreviewer } from './CSV/CsvPreviewer/CsvPreviewer';
import { TxtPreviewer } from './TXT/TxtPreviewer/TxtPreviewer';

export default function DatasetDataPreviewer(props) {
  const { previewFile } = useSelector((state) => state.datasetData);
  if (
    previewFile?.type === 'txt' ||
    previewFile?.type === 'yml' ||
    previewFile?.type === 'yaml' ||
    previewFile?.type === 'log'
  ) {
    return <TxtPreviewer previewFile={previewFile} />;
  }
  switch (previewFile?.type) {
    case 'json': {
      return <JsonPreviewer previewFile={previewFile} />;
    }
    case 'csv': {
      return <CsvPreviewer previewFile={previewFile} />;
    }
    case 'tsv': {
      return <CsvPreviewer previewFile={previewFile} />;
    }
    case null: {
      return <NotSupportCard />;
    }
    default: {
      return <BlankPreviewerCard />;
    }
  }
}
