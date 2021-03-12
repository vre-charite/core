import React, { useState } from 'react';
import { DeleteOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Tag, Tooltip, Checkbox } from 'antd';
import styles from '../../../../index.module.scss';
import { MANIFEST_ATTR_TYPE } from '../../../manifest.values';
import AttrAddBar from './AttrAddBar';
import AttrEditBar from './AttrEditBar';
function CreateManifestTable(props) {
  const [selAttrId, setSelAttrId] = useState();
  const createdAttrs = props.createdAttrs;
  const tableColumns = [
    'Attribute Name',
    'Type',
    'Value',
    'Optional',
    'Actions',
  ];

  function attrType(type) {
    switch (type) {
      case MANIFEST_ATTR_TYPE.MULTIPLE_CHOICE:
        return 'Multiple Choice';
      case MANIFEST_ATTR_TYPE.TEXT:
        return 'Text';
      default:
        return '';
    }
  }
  return (
    <>
      <table className={styles.manifest_table + " " + styles.addManifestTable}>
        <thead>
          <tr>
            <th style={{ width: 180 }}>Attribute Name</th>
            <th style={{ width: 180 }}>Type</th>
            <th>Value</th>
            <th style={{ width: 120 }}>Optional</th>
            <th style={{ width: 120 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {createdAttrs.map((item, ind) => {
            if (ind === selAttrId && props.editMode === 'edit-attr') {
              return (
                <AttrEditBar
                  key={'edit-bar-' + ind}
                  attr={item}
                  selAttrId={selAttrId}
                  setEditMode={props.setEditMode}
                  createdAttrs={props.createdAttrs}
                  setCreatedAttrs={props.setCreatedAttrs}
                  tableColumns={tableColumns}
                />
              );
            }
            return (
              <tr key={'created-attr-' + ind}>
                <td>{item.name}</td>
                <td>{attrType(item.type)}</td>
                <td>
                  {item.value &&
                  item.type === MANIFEST_ATTR_TYPE.MULTIPLE_CHOICE
                    ? item.value.split(',').map((v, vInd) => {
                        return <Tag key={vInd}>{v}</Tag>;
                      })
                    : null}
                </td>
                <td>
                  <Checkbox defaultChecked={item.optional} disabled />
                </td>
                <td>
                  <div style={{ marginTop: -4 }}>
                    <Tooltip title="Edit">
                      <Button
                        shape="circle"
                        icon={<EditOutlined />}
                        onClick={() => {
                          props.setEditMode('edit-attr');
                          setSelAttrId(ind);
                        }}
                        style={{ border: 0, outline: 0 }}
                      ></Button>
                    </Tooltip>
                    <Tooltip
                      title="Delete"
                      onClick={async (e) => {
                        setSelAttrId(ind);
                        const attrs = [...props.createdAttrs];
                        attrs.splice(ind, 1);
                        props.setCreatedAttrs(attrs);
                      }}
                    >
                      <Button
                        shape="circle"
                        icon={<DeleteOutlined />}
                        style={{ border: 0, outline: 0, marginLeft: 6 }}
                      ></Button>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            );
          })}

          {props.editMode === 'add' ? (
            <AttrAddBar
              key="add-bar-end-step2"
              setEditMode={props.setEditMode}
              createdAttrs={props.createdAttrs}
              setCreatedAttrs={props.setCreatedAttrs}
              tableColumns={tableColumns}
            />
          ) : (
            <tr key="add-bar-end-step1">
              <td
                style={{
                  textAlign: 'center',
                }}
                colSpan={tableColumns.length}
              >
                <Button
                  type="link"
                  icon={<PlusOutlined />}
                  onClick={(e) => {
                    props.setEditMode('add');
                  }}
                >
                  Add Attribute
                </Button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
export default CreateManifestTable;
