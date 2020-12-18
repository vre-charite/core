import React, { Component } from 'react';
import { Tag, Input, Typography, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { validateTag } from '../../../../../Utility';
import { addProjectTagsAPI, deleteProjectTagsAPI } from '../../../../../APIs';
import { EditOutlined, CheckOutlined, UpOutlined } from '@ant-design/icons';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

const { Paragraph } = Typography;
const _ = require('lodash');

class FileTags extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tags: this.props.tags,
      inputVisible: false,
      inputValue: '',
      errorMessage: false,
      edit: false,
      expand: false,
      counter: 0,
      manifest: this.props.project.manifest,
    };
  }

  componentDidUpdate(prevProps) {
    //Sometimes the props and state wouldn't align. this is a fix
    if (this.state.tags !== this.props.tags) {
      this.setState({
        tags: this.props.tags,
      });
    }
  }

  handleClose = (removedTag) => {
    const tags = this.state.tags.filter((tag) => tag !== removedTag);
    const { guid, pid } = this.props;
    deleteProjectTagsAPI(pid, { tag: removedTag, taglist: tags, guid: guid })
      .then((res) => {
        this.setState({ tags });
        this.props.refresh();
      })
      .catch((err) => {
        console.log(err);
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
    let { tags } = this.state;
    if (inputValue && _.includes(tags, inputValue)) {
      this.setState({
        errorMessage: this.props.t(
          'formErrorMessages:project.filePanel.tags.exists',
        ),
      });
      return;
    }

    tags = [...tags, inputValue];
    if (tags.length > 10) {
      this.setState({
        errorMessage: this.props.t(
          'formErrorMessages:project.filePanel.tags.limit',
        ),
      });
      return;
    }

    const { guid, pid } = this.props;
    addProjectTagsAPI(pid, { tag: inputValue, taglist: tags, guid: guid })
      .then((res) => {
        this.props.refresh();
        this.setState({
          tags,
          errorMessage: false,
          inputVisible: false,
          inputValue: '',
          edit: true,
        });
      })
      .catch((err) => {
        console.log(err);
      });
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
    const {
      // tags,
      inputVisible,
      inputValue,
      errorMessage,
      edit,
      expandable,
      manifest,
    } = this.state;
    const projectSystemTags = manifest.tags;
    const systemTags = this.props.tags.filter(
      (v) => projectSystemTags && projectSystemTags.indexOf(v) !== -1,
    );
    const tags = this.props.tags.filter(
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
            {!inputVisible && (
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
            {tags.length !== 0 && (
              <Button
                type="link"
                style={{ padding: '0px' }}
                onClick={() => {
                  this.setState({ edit: false });
                  this.typoClose();
                }}
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
            {tags.length !== 0 && (
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
  }),
  {},
)(withTranslation('formErrorMessages')(FileTags));
