import React, { Component } from 'react';
import { Tag, Input, Typography, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { validateTag } from '../../../../../Utility';
import { addProjectTagsAPI, deleteProjectTagsAPI } from '../../../../../APIs'
import { EditOutlined, CheckOutlined, UpOutlined } from '@ant-design/icons';
const { Paragraph } = Typography;
const _ = require('lodash')

export default class FileTags extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tags: this.props.tags,
      inputVisible: false,
      inputValue: '',
      errorMessage: false,
      edit: false,
      expand: false,
      counter: 0
    };
  }

  handleClose = (removedTag) => {
    const tags = this.state.tags.filter((tag) => tag !== removedTag);
    const { guid, pid } = this.props
    deleteProjectTagsAPI(pid, { "tag": removedTag, "taglist": tags, "guid": guid })
    this.setState({ tags });
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
      this.setState({ errorMessage: "Tag should be 1-32 lowercase alphanumeric characters." });
      return;
    }
    let { tags } = this.state;
    if (inputValue && _.includes(tags, inputValue)) {
      this.setState({ errorMessage: "Tag is already existed." });
      return;
    }

    tags = [...tags, inputValue];
    if (tags.length > 10) {
      this.setState({ errorMessage: "Up to 10 tags per file！" });
      return;
    }
    const { guid, pid } = this.props
    addProjectTagsAPI(pid, { tag: inputValue, taglist: tags, guid: guid })
    this.setState({
      tags,
      errorMessage: false,
      inputVisible: false,
      inputValue: '',
    })

  };

  handleOnBlur = () => {
    this.setState({
      inputVisible: false,
      errorMessage: false,
    });
  };

  saveInputRef = input => {
    this.inputRef = input;
  };

  typoExpand = () => {
    this.setState({
      expand: true,
      counter: !this.state.expand
        ? this.state.counter + 0
        : this.state.counter + 1
    });
  };

  typoClose = () => {
    this.setState({
      expand: false,
      counter: !this.state.expand
        ? this.state.counter + 0
        : this.state.counter + 1
    });
  };


  render() {
    const { tags, inputVisible, inputValue, errorMessage, edit, expandable } = this.state;
    return (
      <>
        {edit || tags.length === 0 ? <>
          {inputVisible && (
            <Input
              type="text"
              size="small"
              ref={this.saveInputRef}
              style={{ width: 78, textTransform: 'lowercase', marginRight: '8px' }}
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
              onClose={(e) => {
                e.preventDefault();
                this.handleClose(tag);
              }}
            >
              {tag}
            </Tag>
          ))}
          {tags.length !== 0 && <Button
            type='link'
            style={{ padding: '0px' }}
            onClick={() => {
              this.setState({ edit: false });
              this.typoClose()
            }}
            icon={<CheckOutlined />}>
            Save
          </Button>}

          {errorMessage ? (
            <div style={{ color: 'red' }}>
              {errorMessage}
            </div>
          ) : null}
        </> :
          <div key={this.state.counter}>
            <Paragraph
              ellipsis={{
                rows: 1,
                expandable: true,
                symbol: 'more',
                onExpand: this.typoExpand
              }}
              style={{ marginBottom: '0px' }}
            >
              {tags.map((tag) => (
                <Tag
                  color="blue"
                >
                  {tag}
                </Tag>
              ))}
              {tags.length !== 0 && (
                <Button
                  type='link'
                  style={{ padding: '0px' }}
                  onClick={() => this.setState({ edit: true })}
                  icon={<EditOutlined />}>
                  Edit Tag {' '}
                </Button>)}
              {this.state.expand &&
                <Button
                  type='link'
                  style={{ padding: '0px' }}
                  onClick={this.typoClose}
                  icon={<UpOutlined />}>
                  Hide {' '}
                </Button>
              }
            </Paragraph>

          </div>}
      </>
    );
  }
}
