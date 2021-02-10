import React, { useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Tag, Checkbox } from 'antd';
import styles from '../../../../index.module.scss';
import { MANIFEST_ATTR_TYPE } from '../../../manifest.values';
import AttrAddBar from './AttrAddBar';

function FileManifestExistentTable(props) {
  const mItem = props.mItem;
  const tableColumns = ['Attribute Name', 'Type', 'Value', 'Optional'];
  const [editMode, setEditMode] = useState('default');
  function attrType(type) {
    switch (type) {
      case MANIFEST_ATTR_TYPE.MULTIPLE_CHOICE:
        return 'Multiple Choice';
      case MANIFEST_ATTR_TYPE.TEXT:
        return 'Text';
      default: {
      }
    }
    return '';
  }
  // const deleteAttrConfirm = (
  //   <Modal
  //     title="Delete Manifest Attribute"
  //     visible={deleteAttrModalVisible}
  //     onOk={async () => {
  //       await deleteAttrFromManifest(selAttrId);
  //       await props.loadManifest();
  //       setDeleteAttrModalVisible(false);
  //     }}
  //     onCancel={() => setDeleteAttrModalVisible(false)}
  //   >
  //     <p>
  //       Deleting attribute is unrecoverable, are you sure you want to proceed?
  //     </p>
  //   </Modal>
  // );
  return (
    <>
      <table className={styles.manifest_table}>
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
          {mItem.attributes.map((item) => {
            // if (item.id === selAttrId && editMode === 'edit-attr') {
            //   return (
            //     <AttrEditBar
            //       key={'edit-bar-' + item.id}
            //       manifestID={mItem.id}
            //       attr={item}
            //       setEditMode={setEditMode}
            //       loadManifest={props.loadManifest}
            //       tableColumns={tableColumns}
            //     />
            //   );
            // }
            return (
              <tr key={mItem.id + '-' + item.id}>
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
                  {/* <Tooltip title="Edit">
                    <Button
                      shape="circle"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setEditMode('edit-attr');
                        setSelAttrId(item.id);
                      }}
                      style={{ border: 0, outline: 0 }}
                    ></Button>
                  </Tooltip>
                  <Tooltip
                    title="Delete"
                    onClick={async (e) => {
                      setSelAttrId(item.id);
                      setDeleteAttrModalVisible(true);
                    }}
                  >
                    <Button
                      shape="circle"
                      icon={<DeleteOutlined />}
                      style={{ border: 0, outline: 0, marginLeft: 6 }}
                    ></Button>
                  </Tooltip> */}
                </td>
              </tr>
            );
          })}

          {editMode === 'add' ? (
            <AttrAddBar
              key="add-bar-end-step2"
              manifestID={mItem.id}
              attributes={mItem.attributes}
              setEditMode={setEditMode}
              loadManifest={props.loadManifest}
              tableColumns={tableColumns}
            />
          ) : (
            <tr key="add-bar-end-step1">
              <td
                style={{
                  textAlign: 'center',
                }}
                colSpan={5}
              >
                <Button
                  type="link"
                  icon={<PlusOutlined />}
                  onClick={(e) => {
                    setEditMode('add');
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
export default FileManifestExistentTable;
