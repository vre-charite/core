import React, { useState, useContext, useRef } from 'react';
import { Tag, Input, Typography, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { validateTag, useCurrentProject } from '../../../Utility';
import { updateProjectTagsAPI } from '../../../APIs';
import { EditOutlined, UpOutlined, CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import styles from './index.module.scss';
import FileExplorerContext from '../FileExplorerContext';
const { Paragraph } = Typography;
const _ = require('lodash');

function FileTags(props) {
  const [currentDataset] = useCurrentProject();
  const { t } = useTranslation(['tooltips', 'success', 'formErrorMessages']);
  const fileExplorerCtx = useContext(FileExplorerContext);
  const sidePanelCfg = fileExplorerCtx.sidePanelCfg;
  const inputRef = useRef(null);
  const [customizedTags, setCustomizedTags] = useState(props.record.tags);
  const [systemTags, setSystemTags] = useState(props.record.systemTags ? props.record.systemTags : []);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [errorMessage, setErrorMessage] = useState(false);
  const [saveTagsLoading, setSaveTagsLoading] = useState(false);
  const [edit, setEdit] = useState(false);
  const [expand, setExpand] = useState(false);
  const [counter, setCounter] = useState(0);
  const manifest = currentDataset;
  const handleClose = (removedTag) => {
    const tags = customizedTags.filter((tag) => tag !== removedTag);
    setCustomizedTags(tags);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    const inputValueLowercase = inputValue.toLowerCase();

    if (!validateTag(inputValueLowercase)) {
      setErrorMessage(t('formErrorMessages:project.filePanel.tags.valid'));
      return;
    }
    const projectSystemTags = manifest.systemTags;
    if (
      projectSystemTags &&
      projectSystemTags.indexOf(inputValueLowercase) !== -1
    ) {
      setErrorMessage(t('formErrorMessages:project.filePanel.tags.systemtags'));
      return;
    }
    let tags = customizedTags;
    if (inputValueLowercase && _.includes(tags, inputValueLowercase)) {
      setErrorMessage(t('formErrorMessages:project.filePanel.tags.exists'));
      return;
    }

    const tagsNew = [...customizedTags, inputValueLowercase];
    const tagsNewNotSystem = tagsNew.filter(
      (v) => projectSystemTags && projectSystemTags.indexOf(v) === -1,
    );
    if (tagsNewNotSystem.length > 10) {
      setErrorMessage(t('formErrorMessages:project.filePanel.tags.limit'));
      return;
    }
    setCustomizedTags(tagsNew);
    setInputVisible(false);
    setErrorMessage(false);
    setInputValue('');
    setEdit(true);
  };

  const saveTags = async () => {
    try {
      const record = props.record;
      const fileType = record.nodeLabel.includes('Folder') ? 'Folder' : 'File';
      await updateProjectTagsAPI(fileType, record.geid, {
        tags: customizedTags,
        inherit: false,
      });
      setSaveTagsLoading(false);
      setEdit(false);
      setInputValue('');
    } catch (error) {
      setSaveTagsLoading(false);
      setErrorMessage(t('errormessages:updateFileTags.default.0'));
    }
  };

  const handleOnBlur = () => {
    setInputVisible(false);
    setErrorMessage(false);
  };

  const typoExpand = () => {
    setExpand(true);
    setCounter(!expand ? counter + 0 : counter + 1);
  };

  const typoClose = () => {
    setExpand(false);
    setCounter(!expand ? counter + 0 : counter + 1);
  };
  const showEditTagsBtn = (edit, customizedTags) => {
    if (edit) {
      return (
        <div>
          <Button
            type="primary"
            style={{
              padding: '0px',
              height: '22px',
              width: '60px',
              borderRadius: '6px',
            }}
            onClick={async () => {
              setSaveTagsLoading(true);
              await saveTags();
              typoClose();
            }}
            loading={saveTagsLoading}
          >
            Save
          </Button>
          {!saveTagsLoading ? (
            <CloseOutlined
              style={{ cursor: 'pointer', marginLeft: '5px' }}
              onClick={() => {
                setEdit(false);
                setInputValue('');
                setCustomizedTags(props.record.tags);
              }}
            />
          ) : null}
        </div>
      );
    } else {
      if (
        customizedTags.length !== 0 &&
        sidePanelCfg &&
        sidePanelCfg.allowTagEdit
      ) {
        return (
          <Button
            type="link"
            style={{ padding: '0px' }}
            onClick={() => {
              setEdit(true);
            }}
            icon={<EditOutlined />}
          >
            Edit Tags{' '}
          </Button>
        );
      }
    }
  };
  if (!props.record) {
    return null;
  }
  return (
    <>
      {systemTags && systemTags.length && sidePanelCfg.showSystemTags ? (
        <div style={{ marginBottom: 10 }}>
          <p
            style={{
              fontSize: 14,
              marginBottom: 5,
              color: 'rgba(0,0,0,0.85)',
            }}
          >
            System Tags
          </p>
          {systemTags.map((v) => (
            <Tag color="default" key={`${props.guid}-${v}`}>
              {v}
            </Tag>
          ))}
        </div>
      ) : null}
      <div
        className={styles.customized_tags}
        style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap' }}
      >
        <p
          style={{
            fontSize: 14,
            marginBottom: 5,
            marginRight: 10,
            color: 'rgba(0,0,0,0.85)',
            width: '110px',
          }}
        >
          Customized Tags
        </p>
        {showEditTagsBtn(edit, customizedTags)}
      </div>

      {edit || customizedTags.length === 0 ? (
        <>
          {customizedTags.map((tag) => (
            <Tag
              color="blue"
              closable
              style={{ marginTop: '10px' }}
              key={`${props.guid}-${tag}`}
              onClose={(e) => {
                e.preventDefault();
                handleClose(tag);
              }}
            >
              {tag}
            </Tag>
          ))}
          <div style={{ marginTop: '10px' }}>
            {inputVisible && (
              <div>
                <Input
                  type="text"
                  placeholder="Press enter to save it."
                  size="small"
                  ref={inputRef}
                  style={{
                    width: 150,
                    textTransform: 'lowercase',
                    marginRight: '8px',
                  }}
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleOnBlur}
                  onPressEnter={() => {
                    handleInputConfirm();
                  }}
                />
              </div>
            )}
            {!inputVisible && sidePanelCfg && sidePanelCfg.allowTagEdit && (
              <Tag
                onClick={() => {
                  setInputVisible(true, () => {
                    inputRef.current.focus();
                  });
                }}
                className="site-tag-plus"
              >
                <PlusOutlined /> New Tag
              </Tag>
            )}
          </div>
          {errorMessage ? (
            <div style={{ color: 'red' }}>{errorMessage}</div>
          ) : null}
        </>
      ) : (
        <Paragraph
          key={counter}
          ellipsis={{
            rows: 1,
            expandable: true,
            symbol: 'more',
            onExpand: typoExpand,
          }}
          style={{ display: 'inline' }}
        >
          {customizedTags.map((tag) => (
            <Tag
              color="blue"
              style={{ marginTop: '10px' }}
              key={`${props.guid}-${tag}`}
            >
              {tag}
            </Tag>
          ))}
          {expand && (
            <Button
              type="link"
              style={{ padding: '0px', marginLeft: '10px' }}
              onClick={typoClose}
              icon={<UpOutlined />}
            >
              Hide{' '}
            </Button>
          )}
        </Paragraph>
      )}
    </>
  );
}
export default FileTags;
