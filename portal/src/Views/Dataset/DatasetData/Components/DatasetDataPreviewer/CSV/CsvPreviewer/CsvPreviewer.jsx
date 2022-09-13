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
import { DatasetCard as Card } from '../../../../../Components/DatasetCard/DatasetCard';
import { FullscreenOutlined, LoadingOutlined } from '@ant-design/icons';
import { Skeleton, Button, Modal } from 'antd';
import styles from './CsvPreviewer.module.scss';
import {
  previewDatasetFile,
  previewDatasetFileStream,
} from '../../../../../../../APIs';
import { useSelector, useDispatch } from 'react-redux';
import { CsvTable } from './CSVTable';
import Papa from 'papaparse';
export function CsvPreviewer(props) {
  const { previewFile } = props;
  const [csvData, setCsvData] = useState(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const datasetInfo = useSelector((state) => state.datasetInfo.basicInfo);
  const datasetGeid = datasetInfo.geid;
  const largeFile = previewFile.size > 500 * 1024;
  const limit = 1000;
  useEffect(() => {
    async function loadPreview() {
      setLoading(true);
      try {
        if (!largeFile) {
          const res = await previewDatasetFile(datasetGeid, previewFile.geid);
          if (res.data?.result?.content) {
            const parsed = Papa.parse(res.data?.result?.content);
            setCsvData(parsed.data);
          }
        } else {
          const res = await previewDatasetFileStream(
            datasetGeid,
            previewFile.geid,
          );
          const parsed = Papa.parse(res.data);
          parsed.data = parsed.data.slice(0, limit);
          setCsvData(parsed.data);
        }
        setName(previewFile.name);
        setLoading(false);
      } catch (e) {
        setLoading(false);
      }
    }
    loadPreview();
  }, [previewFile.geid]);

  const onEnlarge = () => {
    setIsEnlarged(true);
  };

  return (
    <>
      {loading ? (
        <div style={{ margin: '40px 24px' }}>
          <Skeleton loading={loading}></Skeleton>
        </div>
      ) : (
        <>
          <Card
            title={name}
            extra={
              name && (
                <Button
                  className={styles['enlarge-button']}
                  type="link"
                  icon={<FullscreenOutlined />}
                  onClick={onEnlarge}
                >
                  Enlarge
                </Button>
              )
            }
          >
            {!loading && csvData && csvData.length && (
              <CsvTable csvData={csvData} largeFile={largeFile} />
            )}
          </Card>
          <div>
            <Modal
              maskClosable={false}
              onCancel={() => setIsEnlarged(false)}
              footer={null}
              width={'90%'}
              title={name}
              forceRender={true}
              visible={isEnlarged}
              className={styles['enlarged_csv_model']}
            >
              {csvData && csvData.length && (
                <CsvTable csvData={csvData} largeFile={largeFile} />
              )}
            </Modal>
          </div>
        </>
      )}
    </>
  );
}
