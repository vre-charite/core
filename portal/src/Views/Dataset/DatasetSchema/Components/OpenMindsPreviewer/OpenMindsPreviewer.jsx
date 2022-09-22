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
import { useSelector, useDispatch } from 'react-redux';
import { schemaTemplatesActions } from '../../../../../Redux/actions';
import { JsonMonacoEditor } from '../../../DatasetData/Components/DatasetDataPreviewer/JSON/JsonMonacoEditor/JsonMonacoEditor';
import { CloseOutlined } from '@ant-design/icons';
import { getSchemaDataDetail } from '../../../../../APIs';
export function OpenMindsPreviewer(props) {
  const dispatch = useDispatch();
  const schemas = useSelector((state) => state.schemaTemplatesInfo.schemas);
  const schemaPreviewGeid = useSelector(
    (state) => state.schemaTemplatesInfo.schemaPreviewGeid,
  );
  const selSchema = schemas.find((s) => s.geid === schemaPreviewGeid);
  const datasetInfo = useSelector((state) => state.datasetInfo.basicInfo);
  const datasetGeid = datasetInfo.geid;
  const [json, setJson] = useState(null);
  useEffect(() => {
    async function loadSchemaDetail() {
      const res = await getSchemaDataDetail(datasetGeid, schemaPreviewGeid);
      if (res?.data?.result?.content) {
        const schemaDataJSON = res?.data?.result?.content;
        setJson(schemaDataJSON);
      }
    }
    if (schemaPreviewGeid) {
      loadSchemaDetail();
    }
  }, [schemaPreviewGeid]);
  return selSchema ? (
    <div>
      <div
        style={{
          background: '#E6F5FF',
          color: '#1890FF',
          fontSize: 14,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '5px 30px',
          marginBottom: 10,
        }}
      >
        <span>{selSchema.name}</span>
        <CloseOutlined
          style={{ color: '#818181' }}
          onClick={(e) => {
            dispatch(schemaTemplatesActions.setPreviewSchemaGeid(null));
          }}
        />
      </div>
      {json ? (
        <JsonMonacoEditor key={schemaPreviewGeid} json={json} format={true} />
      ) : null}
    </div>
  ) : null;
}
