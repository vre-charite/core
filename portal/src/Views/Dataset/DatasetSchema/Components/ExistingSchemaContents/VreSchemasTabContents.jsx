import React from 'react';
import { FileOutlined } from '@ant-design/icons';

const VreSchemasTabContents = (props) => {
  const {
    setSchemaGeid,
    schemaGeid,
    schemas,
    handleOnClick,
    schemaActionButtons,
    tabContentStyle,
  } = props;

  return (
    <div>
      {schemas.length
        ? schemas
            .filter((el) => !el.isDraft && el.standard === 'vre') // hide draft schemas and openMINDS schemas when renders
            .map((el) => (
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
                        fontWeight: '700'
                      }}
                    >{`${el.name}`}</span>
                    <span style={{ fontSize: '10px'}}>
                      {el.systemDefined ? 'Default' : 'Custom'}
                    </span>
                  </div>
                </div>
                {schemaGeid === el.geid && schemaActionButtons(el)}
              </div>
            ))
        : null}
    </div>
  );
};

export default VreSchemasTabContents;
