import React, { Component } from 'react';
import { Tag, Input, Typography, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { validateTag } from '../../../../../Utility';
import { updateProjectTagsAPI } from '../../../../../APIs';
import {
  EditOutlined,
  CheckOutlined,
  UpOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { withTranslation } from 'react-i18next';
import { setSuccessNum } from '../../../../../Redux/actions';
import { connect } from 'react-redux';
import { PanelKey } from './RawTableValues';
import styles from './index.module.scss';
import i18n from '../../../../../i18n';
const { Paragraph } = Typography;
const _ = require('lodash');

class FileTags extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tagsEdited: [],
      inputVisible: false,
      inputValue: '',
      errorMessage: false,
      edit: false,
      expand: false,
      saveTagsLoading: false,
      counter: 0,
      manifest: this.props.project.manifest,
    };
  }

  componentDidMount() {
    this.setState({
      tagsEdited: this.props.record.tags,
    });
  }

  componentWillReceiveProps = (nextProps) => {
    if (
      this.props.record.geid !== nextProps.record.geid ||
      this.props.record.tags.join('') !== nextProps.record.tags.join('')
    ) {
      this.setState({
        tagsEdited: nextProps.record.tags,
      });
    }
  };

  handleClose = (removedTag) => {
    const tags = this.state.tagsEdited.filter((tag) => tag !== removedTag);
    this.setState({
      tagsEdited: tags,
    });
  };

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.inputRef.focus());
  };

  handleInputChange = (e) => {
    this.setState({ inputValue: e.target.value });
  };

  handleInputConfirm = () => {
    let { inputValue } = this.state;
    inputValue = inputValue.toLowerCase();

    if (!validateTag(inputValue)) {
      this.setState({
        errorMessage: this.props.t(
          'formErrorMessages:project.filePanel.tags.valid',
        ),
      });
      return;
    }
    const projectSystemTags = this.state.manifest.tags;
    if (projectSystemTags && projectSystemTags.indexOf(inputValue) !== -1) {
      this.setState({
        errorMessage: this.props.t(
          'formErrorMessages:project.filePanel.tags.systemtags',
        ),
      });
      return;
    }
    let tags = this.state.tagsEdited;
    if (inputValue && _.includes(tags, inputValue)) {
      this.setState({
        errorMessage: this.props.t(
          'formErrorMessages:project.filePanel.tags.exists',
        ),
      });
      return;
    }

    const tagsNew = [...tags, inputValue];
    const tagsNewNotSystem = tagsNew.filter(
      (v) => projectSystemTags && projectSystemTags.indexOf(v) === -1,
    );
    if (tagsNewNotSystem.length > 10) {
      this.setState({
        errorMessage: this.props.t(
          'formErrorMessages:project.filePanel.tags.limit',
        ),
      });
      return;
    }
    this.setState({
      tagsEdited: tagsNew,
      errorMessage: false,
      inputVisible: false,
      inputValue: '',
      edit: true,
    });
  };

  saveTags = async () => {
    try {
      const { record } = this.props;
      const customizedTags = this.state.tagsEdited.filter(
        (el) => !this.state.manifest.tags.includes(el),
      );
      const fileType = record.nodeLabel.includes('Folder') ? 'Folder' : 'File';
      await updateProjectTagsAPI(fileType, record.geid, {
        tags: customizedTags,
        inherit: false,
      });
      this.setState({ saveTagsLoading: false, edit: false, inputValue: '' });
      this.props.setSuccessNum(this.props.successNum + 1);
    } catch (error) {
      this.setState({ saveTagsLoading: false });
      message.error(`${i18n.t('errormessages:updateFileTags.default.0')}`, 3);
    }
  };

  handleOnBlur = () => {
    this.setState({
      inputVisible: false,
      errorMessage: false,
    });
  };

  saveInputRef = (input) => {
    this.inputRef = input;
  };

  typoExpand = () => {
    this.setState({
      expand: true,
      counter: !this.state.expand
        ? this.state.counter + 0
        : this.state.counter + 1,
    });
  };

  typoClose = () => {
    this.setState({
      expand: false,
      counter: !this.state.expand
        ? this.state.counter + 0
        : this.state.counter + 1,
    });
  };

  showEditTagsBtn = (edit, tags) => {
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
              this.setState({
                saveTagsLoading: true,
              });
              await this.saveTags();
              this.typoClose();
            }}
            loading={this.state.saveTagsLoading}
          >
            Save
          </Button>
          {!this.state.saveTagsLoading ? (
            <CloseOutlined
              style={{ cursor: 'pointer', marginLeft: '5px' }}
              onClick={() => {
                this.setState({
                  edit: false,
                  inputValue: '',
                  tagsEdited: this.props.record.tags,
                });
              }}
            />
          ) : null}
        </div>
      );
    } else {
      if (
        tags.length !== 0 &&
        this.props.panelKey &&
        !this.props.panelKey.includes('trash')
      ) {
        return (
          <Button
            type="link"
            style={{ padding: '0px' }}
            onClick={() => this.setState({ edit: true })}
            icon={<EditOutlined />}
          >
            Edit Tags{' '}
          </Button>
        );
      }
    }
  };

  render() {
    if (!this.props.record) {
      return null;
    }
    const { inputVisible, inputValue, errorMessage, edit, manifest } =
      this.state;
    const projectSystemTags = manifest?.tags;

    const systemTags = this.state.tagsEdited.filter(
      (v) => projectSystemTags && projectSystemTags.indexOf(v) !== -1,
    );
    const tags = this.state.tagsEdited.filter(
      (v) => projectSystemTags && projectSystemTags.indexOf(v) === -1,
    );
    return (
      <>
        {systemTags &&
        systemTags.length &&
        (this.props.panelKey === PanelKey.GREENROOM_HOME ||
          this.props.panelKey === PanelKey.GREENROOM) ? (
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
              <Tag color="default" key={`${this.props.guid}-${v}`}>
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
          {this.showEditTagsBtn(edit, tags)}
        </div>

        {edit || tags.length === 0 ? (
          <>
            {tags.map((tag) => (
              <Tag
                color="blue"
                closable
                style={{ marginTop: '10px' }}
                key={`${this.props.guid}-${tag}`}
                onClose={(e) => {
                  e.preventDefault();
                  this.handleClose(tag);
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
                    ref={this.saveInputRef}
                    style={{
                      width: 150,
                      textTransform: 'lowercase',
                      marginRight: '8px',
                    }}
                    value={inputValue}
                    onChange={this.handleInputChange}
                    onBlur={this.handleOnBlur}
                    onPressEnter={this.handleInputConfirm}
                  />
                </div>
              )}
              {!inputVisible &&
                this.props.panelKey &&
                !this.props.panelKey.includes('trash') && (
                  <Tag onClick={this.showInput} className="site-tag-plus">
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
            key={this.state.counter}
            ellipsis={{
              rows: 1,
              expandable: true,
              symbol: 'more',
              onExpand: this.typoExpand,
            }}
            style={{ display: 'inline' }}
          >
            {tags.map((tag) => (
              <Tag
                color="blue"
                style={{ marginTop: '10px' }}
                key={`${this.props.guid}-${tag}`}
              >
                {tag}
              </Tag>
            ))}
            {this.state.expand && (
              <Button
                type="link"
                style={{ padding: '0px', marginLeft: '10px' }}
                onClick={this.typoClose}
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
}

export default connect(
  (state) => ({
    project: state.project,
    successNum: state.successNum,
  }),
  { setSuccessNum },
)(withTranslation('formErrorMessages')(FileTags));
