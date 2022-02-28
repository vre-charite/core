import React, { useState, useEffect } from 'react';
import { DatasetCard as Card } from '../../../../../Components/DatasetCard/DatasetCard';
import { FullscreenOutlined, FileImageOutlined } from '@ant-design/icons';
import { Skeleton, Button } from 'antd';
import { JsonMonacoEditor } from '../JsonMonacoEditor/JsonMonacoEditor';
import styles from './JsonPreviewer.module.scss';
import { JsonPreviewerEnlargedModal } from '../JsonPreviewerEnlargedModal/JsonPreviewerEnlargedModal';
import { previewDatasetFile } from '../../../../../../../APIs';
import { useSelector, useDispatch } from 'react-redux';
export function JsonPreviewer(props) {
  const { previewFile } = props;
  const [json, setJson] = useState(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const datasetInfo = useSelector((state) => state.datasetInfo.basicInfo);
  const datasetGeid = datasetInfo.geid;
  const largeFile = previewFile.size > 500 * 1024;
  useEffect(() => {
    async function loadPreview() {
      setLoading(true);
      try {
        const res = await previewDatasetFile(datasetGeid, previewFile.geid);
        if (!largeFile) {
          if (res.data?.result?.content) {
            setJson(JSON.parse(res.data?.result?.content));
          }
        } else {
          setJson(res.data?.result?.content);
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
        {!loading && <JsonMonacoEditor json={json} format={!largeFile} />}
      </Card>
      <JsonPreviewerEnlargedModal
        name={name}
        json={json}
        format={!largeFile}
        isEnlarged={isEnlarged}
        setIsEnlarged={setIsEnlarged}
      />
    </>
  );
}
