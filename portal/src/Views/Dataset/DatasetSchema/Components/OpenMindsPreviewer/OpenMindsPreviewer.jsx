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
