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
