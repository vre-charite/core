import React, { useEffect, useState } from 'react';
import { Modal, Button, Input, message, Form, Select } from 'antd';
import {
  createVirtualFolder,
  addToVirtualFolder,
  listAllVirtualFolder,
} from '../../../../../../../APIs';
import { PlusOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import CollectionIcon from '../../../../../../../Components/Icons/Collection';
import { setCurrentProjectTreeVFolder } from '../../../../../../../Redux/actions';
import { trimString } from '../../../../../../../Utility';
import i18n from '../../../../../../../i18n';
const VirtualFolderModal = ({ visible, setVisible, files }) => {
  const { Option } = Select;
  const [openCreatePanel, setOpenCreatePanel] = useState(false);
  const [sentBtnLoading, setSentBtnLoading] = useState(false);
  const [sentExistBtnLoading, setSentExistBtnLoading] = useState(false);
  const [form] = Form.useForm();
  const [formExistent] = Form.useForm();
  const [vfolders, setVFolders] = useState([]);
  const dispatch = useDispatch();
  const project = useSelector((state) => state.project);
  function updateVFolder(vfolders) {
    const vfoldersNodes = vfolders.map((folder) => {
      return {
        title: folder.name,
        key: 'vfolder-' + folder.name,
        icon: <CollectionIcon width={14} style={{ color: '#1b90fe' }} />,
        disabled: false,
        children: null,
        geid: folder.geid,
        createdTime: folder.timeCreated,
      };
    });
    console.log(vfolders, 'vfolders');
    dispatch(setCurrentProjectTreeVFolder(vfoldersNodes));
  }
  function handleOk() {}
  function closeModal() {
    setVisible(false);
    setOpenCreatePanel(false);
    setSentBtnLoading(false);
    setSentExistBtnLoading(false);
    form.resetFields();
    formExistent.resetFields();
  }
  const handleCancel = () => {
    closeModal();
  };

  useEffect(() => {
    async function loadVFolders() {
      if (visible) {
        const allVirtualRes = await listAllVirtualFolder(
          project.profile?.globalEntityId,
        );
        const virualFolders = allVirtualRes.data.result;
        setVFolders(virualFolders);
      }
    }
    loadVFolders();
    // eslint-disable-next-line
  }, [visible]);

  async function addToExistFolder(values) {
    try {
      const folderGeid = values.folder;
      const res = await addToVirtualFolder(folderGeid, files);
      if (res.data.result === 'duplicate') {
        message.success(
          `${i18n.t('success:virtualFolder.addFilesDuplicate')}`,
          3,
        );
      } else {
        message.success(`${i18n.t('success:virtualFolder.addFiles')}`, 3);
      }
    } catch (e) {
      message.error(
        `${i18n.t('errormessages:addFilesToVirtualFolder.default.0')}`,
        3,
      );
      setSentExistBtnLoading(false);
      return;
    }

    closeModal();
  }
  async function addToNewFolder(values) {
    const collection = trimString(values.Name);
    try {
      const res = await createVirtualFolder(
        project.profile?.globalEntityId,
        collection,
      );
      if (parseInt(res.data.code / 100) !== 2) {
        setSentBtnLoading(false);
        return;
      }
      const folderGeid = res.data.result.globalEntityId;
      if (!folderGeid) {
        message.error(
          `${i18n.t('errormessages:createVirtualFolder.default.0')}`,
          3,
        );
        setSentBtnLoading(false);
        return;
      }
      await addToVirtualFolder(folderGeid, files);
      const allVirtualRes = await listAllVirtualFolder(
        project.profile?.globalEntityId,
      );
      const virualFolders = allVirtualRes.data.result;
      updateVFolder(virualFolders);
    } catch (e) {
      switch (e.response?.status) {
        case 409: {
          message.error(
            `${i18n.t('errormessages:createVirtualFolder.duplicate.0')}`,
            3,
          );
          break;
        }
        case 400: {
          message.error(
            `${i18n.t('errormessages:createVirtualFolder.limit.0')}`,
            3,
          );
          break;
        }
        default: {
          message.error(
            `${i18n.t('errormessages:createVirtualFolder.default.0')}`,
            3,
          );
        }
      }
      setSentBtnLoading(false);
      return;
    }
    message.success(`${i18n.t('success:virtualFolder.addFiles')}`, 3);
    closeModal();
  }

  return (
    <Modal
      width={350}
      centered
      title="Add Files To Collection"
      visible={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={null}
    >
      {!openCreatePanel ? (
        <>
          <Form
            layout="vertical"
            form={formExistent}
            onFinish={addToExistFolder}
            onFinishFailed={() => {
              setSentExistBtnLoading(false);
            }}
          >
            <Form.Item
              name="folder"
              label="Existing Collection"
              rules={[{ required: true, message: 'Please select collection' }]}
            >
              <Select>
                {vfolders.map((v) => {
                  return (
                    <Option key={v.geid} value={v.geid}>
                      {v.name}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={sentExistBtnLoading}
                onClick={() => setSentExistBtnLoading(true)}
                style={{ float: 'right', marginLeft: 20 }}
              >
                Add To Existing Collection
              </Button>
            </Form.Item>
          </Form>

          <div
            style={{
              width: 350,
              marginLeft: -24,
              borderTop: '1px solid #f0f0f0',
              marginBottom: 20,
            }}
          ></div>
        </>
      ) : null}
      {openCreatePanel ? (
        <Form
          layout="vertical"
          form={form}
          onFinish={addToNewFolder}
          onFinishFailed={() => {
            setSentBtnLoading(false);
          }}
        >
          <Form.Item
            name="Name"
            label={`Name`}
            style={{ marginBottom: 10 }}
            rules={[
              {
                required: true,
                message: 'Collection name is required',
              },
              {
                validator: (rule, value) => {
                  const collection = value ? trimString(value) : null;
                  if (!collection) {
                    return Promise.reject(
                      'Collection name should be 1 ~ 20 characters',
                    );
                  }
                  const isLengthValid =
                    collection.length >= 1 && collection.length <= 20;
                  if (!isLengthValid) {
                    return Promise.reject(
                      'Collection name should be 1 ~ 20 characters',
                    );
                  } else {
                    const specialChars = [
                      '\\',
                      '/',
                      ':',
                      '?',
                      '*',
                      '<',
                      '>',
                      '|',
                      '"',
                      "'",
                    ];
                    for (let char of specialChars) {
                      if (collection.indexOf(char) !== -1) {
                        return Promise.reject(
                          `Collection name can not contain any of the following character ${specialChars.join(
                            ' ',
                          )}`,
                        );
                      }
                    }
                    return Promise.resolve();
                  }
                },
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="Privacy" label={`Privacy`}>
            <Select defaultValue="Personal" disabled>
              <Option value="Personal">Personal</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={sentBtnLoading}
              onClick={() => setSentBtnLoading(true)}
              style={{ float: 'right', marginLeft: 20 }}
            >
              Create New Collection
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              style={{ float: 'right' }}
              disabled={sentBtnLoading}
              onClick={() => setOpenCreatePanel(false)}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <div
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            setOpenCreatePanel(true);
          }}
        >
          <PlusOutlined /> Create New Collection
        </div>
      )}
    </Modal>
  );
};

export default VirtualFolderModal;
