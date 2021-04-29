import React, { Component } from 'react';
import { Tag, Input, Typography, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { validateTag } from '../../../../../Utility';
import {
  updateProjectTagsAPI,
  deleteProjectTagsAPI,
} from '../../../../../APIs';
import { EditOutlined, CheckOutlined, UpOutlined } from '@ant-design/icons';
import { withTranslation } from 'react-i18next';
import { setSuccessNum } from '../../../../../Redux/actions';
import { connect } from 'react-redux';

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
    if (tagsNew.length > 10) {
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
    const { geid, pid } = this.props;
    // const projectSystemTags = this.state.manifest.tags;
    const customizedTags = this.state.tagsEdited;
    // .filter(
    //   (v) => projectSystemTags && projectSystemTags.indexOf(v) === -1,
    // );
    await updateProjectTagsAPI(pid, {
      taglist: customizedTags,
      geid: geid,
    });
    this.props.setSuccessNum(this.props.successNum + 1);
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

  render() {
    if (!this.props.record) {
      return null;
    }
    const {
      inputVisible,
      inputValue,
      errorMessage,
      edit,
      manifest,
    } = this.state;
    const projectSystemTags = manifest.tags;
    const systemTags = this.state.tagsEdited.filter(
      (v) => projectSystemTags && projectSystemTags.indexOf(v) !== -1,
    );
    const tags = this.state.tagsEdited.filter(
      (v) => projectSystemTags && projectSystemTags.indexOf(v) === -1,
    );
    return (
      <>
        {systemTags && systemTags.length ? (
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

        <p style={{ fontSize: 14, marginBottom: 5, color: 'rgba(0,0,0,0.85)' }}>
          Customized Tags
        </p>
        {edit || tags.length === 0 ? (
          <>
            {inputVisible && (
              <Input
                type="text"
                size="small"
                ref={this.saveInputRef}
                style={{
                  width: 78,
                  textTransform: 'lowercase',
                  marginRight: '8px',
                }}
                value={inputValue}
                onChange={this.handleInputChange}
                onBlur={this.handleOnBlur}
                onPressEnter={this.handleInputConfirm}
              />
            )}
            {!inputVisible &&
              this.props.panelKey &&
              !this.props.panelKey.includes('trash') && (
                <Tag onClick={this.showInput} className="site-tag-plus">
                  <PlusOutlined /> New Tag
                </Tag>
              )}
            {tags.map((tag) => (
              <Tag
                color="blue"
                closable
                key={`${this.props.guid}-${tag}`}
                onClose={(e) => {
                  e.preventDefault();
                  this.handleClose(tag);
                }}
              >
                {tag}
              </Tag>
            ))}
            {edit && (
              <Button
                type="link"
                style={{ padding: '0px' }}
                onClick={async () => {
                  this.setState({
                    saveTagsLoading: true,
                  });
                  await this.saveTags();
                  this.setState({ saveTagsLoading: false, edit: false });
                  this.typoClose();
                }}
                loading={this.state.saveTagsLoading}
                icon={<CheckOutlined />}
              >
                Finish Edit
              </Button>
            )}

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
              <Tag color="blue" key={`${this.props.guid}-${tag}`}>
                {tag}
              </Tag>
            ))}
            {tags.length !== 0 &&
              this.props.panelKey &&
              !this.props.panelKey.includes('trash') && (
                <Button
                  type="link"
                  style={{ padding: '0px' }}
                  onClick={() => this.setState({ edit: true })}
                  icon={<EditOutlined />}
                >
                  Edit Tags{' '}
                </Button>
              )}
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
