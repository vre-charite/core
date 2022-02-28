import React from 'react';
import { Button } from 'antd';
import { CloudUploadOutlined } from '@ant-design/icons';
import { FileOutlined } from '@ant-design/icons';
import styles from './index.module.scss';

const OpenMindsSchemaTabContents = (props) => {
  const {
    setModalVisibility,
    schemaGeid,
    schemas,
    handleOnClick,
    schemaActionButtons,
    tabContentStyle,
  } = props;
  console.log(schemas);

  return (
    <>
      <div className={styles.upload_btn}>
        <Button
          type="primary"
          icon={<CloudUploadOutlined />}
          onClick={() => setModalVisibility(true)}
        >
          Upload Schemas
        </Button>
      </div>
      <div style={{ maxHeight: 500, paddingTop: 40, overflow: 'auto' }}>
        {schemas.length
          ? schemas
              .filter((el) => !el.isDraft && el.standard === 'open_minds') // hide draft schemas when renders
              .map((el) => {
                return (
                  <div
                    style={
                      schemaGeid === el.geid
                        ? { ...tabContentStyle, backgroundColor: '#E6F5FF' }
                        : tabContentStyle
                    }
                    onClick={() => handleOnClick(el)}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginLeft: '20px',
                      }}
                    >
                      <FileOutlined style={{ marginRight: '20px' }} />{' '}
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span
                          style={{
                            fontSize: '12px',
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontWeight: '700',
                          }}
                        >{`${el.name}`}</span>
                        <span style={{ fontSize: '10px' }}>OpenMINDs</span>
                      </div>
                    </div>
                    {schemaGeid === el.geid && schemaActionButtons(el)}
                  </div>
                );
              })
          : null}
      </div>
    </>
  );
};

export default OpenMindsSchemaTabContents;
