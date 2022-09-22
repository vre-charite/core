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
import { FullscreenOutlined, FileImageOutlined } from '@ant-design/icons';
import { Skeleton, Button, Modal } from 'antd';
import { TxtMonacoEditor } from '../TxtMonacoEditor/TxtMonacoEditor';
import styles from './TxtPreviewer.module.scss';
import { previewDatasetFile } from '../../../../../../../APIs';
import { useSelector, useDispatch } from 'react-redux';
export function TxtPreviewer(props) {
  const { previewFile } = props;
  const [txt, setTxt] = useState(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const datasetInfo = useSelector((state) => state.datasetInfo.basicInfo);
  const datasetGeid = datasetInfo.geid;
  const largeFile = previewFile.size > 500 * 1024;
  useEffect(() => {
    async function loadPreview() {
      setLoading(true);
      setLoading(true);
      try {
        const res = await previewDatasetFile(datasetGeid, previewFile.geid);
        setTxt(res.data?.result?.content);
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
        {!loading && <TxtMonacoEditor text={txt} largeFile={largeFile} />}
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
          className={styles['enlarged_txt_model']}
        >
          {!loading && <TxtMonacoEditor text={txt} largeFile={largeFile} />}
        </Modal>
      </div>
    </>
  );
}
