import React, { Component } from 'react';
import { Tag, Input, Typography, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { validateTag } from '../../../../../Utility';
import { addProjectTagsAPI, deleteProjectTagsAPI } from '../../../../../APIs';
import { EditOutlined, CheckOutlined, UpOutlined } from '@ant-design/icons';
import { withTranslation } from 'react-i18next';

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
    deleteProjectTagsAPI(pid, { tag: removedTag, taglist: tags, guid: guid });
    this.setState({ tags });
    this.props.refresh();
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
    addProjectTagsAPI(pid, { tag: inputValue, taglist: tags, guid: guid });
    this.props.refresh();
    this.setState({
      tags,
      errorMessage: false,
      inputVisible: false,
      inputValue: '',
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
    } = this.state;
    const tags = this.props.tags;

    return (
      <>
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
          // <div>
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
          // </div>
        )}
      </>
    );
  }
}

export default withTranslation('formErrorMessages')(FileTags);
