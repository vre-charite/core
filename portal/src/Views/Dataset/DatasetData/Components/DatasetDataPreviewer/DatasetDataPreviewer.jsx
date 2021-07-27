import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { BlankPreviewerCard } from './BlankPreviewerCard/BlankPreviewerCard';
import { JsonPreviewer } from './JSON/JsonPreviewer/JsonPreviewer';
import { CsvPreviewer } from './CSV/CsvPreviewer/CsvPreviewer';
import { TxtPreviewer } from './TXT/TxtPreviewer/TxtPreviewer';

export default function DatasetDataPreviewer(props) {
  const { previewFile } = useSelector((state) => state.datasetData);

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
    case 'txt': {
      return <TxtPreviewer previewFile={previewFile} />;
    }
    default: {
      return <BlankPreviewerCard />;
    }
  }
}
