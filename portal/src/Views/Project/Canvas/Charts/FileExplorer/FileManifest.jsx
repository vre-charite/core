import React, { useState, useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { Descriptions, Input, Button, Select, message } from 'antd';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';
import { getManifestById, updateFileManifestAPI } from '../../../../../APIs';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { ErrorMessager, namespace } from '../../../../../ErrorMessages';
const { Option } = Select;
function FileManifest({ currentRecord, permission, updateFileManifest }) {
  const { t } = useTranslation(['errormessages']);
  if (!currentRecord.manifest) {
    currentRecord.manifest = [];
  }
  const { keycloak } = useKeycloak();
  const [attributes, setAttributes] = useState(
    currentRecord.manifest.map((item) => ({
      ...item,
      editing: false,
      draft: item.value,
    })),
  );
  const [manifests, setManifests] = useState(null); // manifest from the server
  useEffect(() => {
    const manifest = currentRecord.manifest.map((item) => ({
      ...item,
      editing: false,
      draft: item.value,
    }));
    setAttributes(manifest);
  }, [currentRecord]);

  useEffect(() => {
    const manifestId = currentRecord?.manifest[0]?.manifest_id;
    if (typeof manifestId === 'number') {
      getManifestById(manifestId)
        .then((res) => {
          const { attributes } = res.data.result;
          setManifests(attributes);
        })
        .catch((err) => {
          const errorMessage = new ErrorMessager(
            namespace.manifest.getManifestById,
          );
          errorMessage.triggerMsg(null, null, { manifestId: manifestId });
          //message.error('Failed to get the Manifest id: ' + manifestId);
        });
    }
  }, [currentRecord.manifest[0]?.manifest_id]);

  const editable = currentRecord.nodeLabel.indexOf('TrashFile') === -1;
  const onSave = (attrIndex) => {
    const newAttr = [...attributes];
    const isOptional = newAttr[attrIndex].optional;
    const isText = newAttr[attrIndex].type;
    const draft = newAttr[attrIndex].draft;
    if (!isOptional && (typeof draft !== 'string' || draft.length === 0)) {
      message.error(t('errormessages:editManifestOnFile.emptyNonOptional.0'));
      return;
    }
    if (isText && typeof draft === 'string' && draft.length > 100) {
      message.error(t('errormessages:editManifestOnFile.lengthExceed.0'));
      return;
    }
    newAttr[attrIndex].value = draft;
    const attrObj = {};
    newAttr.forEach((item) => {
      attrObj[item.name] = item.value;
    });
    updateFileManifestAPI(currentRecord.geid, attrObj)
      .then((res) => {
        currentRecord.manifest = newAttr;
        updateFileManifest(currentRecord, attrIndex);
      })
      .catch((err) => {
        message.error(t('errormessages:updateFileManifestAPI.default.0'));
      })
      .finally(() => {
        newAttr[attrIndex].editing = false;
        setAttributes(newAttr);
      });
  };

  const handleCancel = (index) => {
    const newAttr = [...attributes];
    newAttr[index].editing = false;
    newAttr[index].draft = newAttr[index].value;
    setAttributes(newAttr);
  };
  const handleEdit = (e, index) => {
    const value = e.target.value;
    const newAttr = [...attributes];
    newAttr[index].draft = value;
    setAttributes(newAttr);
  };
  return (
    <>
      <h3 style={{ color: 'rgba(0,0,0,0.45)', fontSize: 14 }}>
        {currentRecord?.manifest[0]?.manifest_name}
      </h3>
      <Descriptions size="small" column={1}>
        {attributes.map((item, index) => (
          <Descriptions.Item
            label={item.name}
            style={{ wordBreak: 'break-word' }}
          >
            {item.editing ? (
              <>
                {item.type === 'multiple_choice' ? (
                  <Select
                    dropdownStyle={{ minWidth: 50 }}
                    value={item.draft}
                    onChange={(value) => {
                      const e = { target: { value } };
                      handleEdit(e, index);
                    }}
                    placeholder="Please select a attribute"
                    getPopupContainer={(trigger) =>
                      trigger.parentElement.parentElement.parentElement
                    }
                  >
                    {_.find(
                      manifests,
                      (manifest) => manifest.name === item.name,
                    )
                      ?.value?.split(',')
                      ?.map((option) => {
                        return <Option value={option}>{option}</Option>;
                      })}
                    {item.optional && (
                      <Option value="">
                        <em>null</em>
                      </Option>
                    )}
                  </Select>
                ) : (
                  <Input
                    value={item.draft}
                    onChange={(e) => {
                      handleEdit(e, index);
                    }}
                  ></Input>
                )}{' '}
                <>
                  <Button
                    type="link"
                    style={{ padding: '0px', marginLeft: 5 }}
                    icon={<SaveOutlined />}
                    onClick={() => {
                      onSave(index);
                    }}
                  >
                    save
                  </Button>
                  <Button
                    type="link"
                    style={{ padding: '0px', color: 'grey', marginLeft: 5 }}
                    onClick={() => {
                      handleCancel(index);
                    }}
                  >
                    cancel
                  </Button>
                </>
              </>
            ) : (
              <>
                <span>{item.value || <em>null</em>}</span>
                {editable && (
                  <Button
                    type="link"
                    style={{ padding: '0px' }}
                    icon={<EditOutlined />}
                    onClick={() => {
                      const newAttr = [...attributes];
                      newAttr[index].editing = true;
                      setAttributes(newAttr);
                    }}
                  >
                    Edit
                  </Button>
                )}
              </>
            )}
          </Descriptions.Item>
        ))}
      </Descriptions>
    </>
  );
}

export default FileManifest;
