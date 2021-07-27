import React, { useState, useEffect } from 'react';
import { Input, Button, Select, Form, Checkbox, message } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { CloseCircleFilled, PlusOutlined } from '@ant-design/icons';
const Option = Select.Option;

const defineDefaultValue = (condition) => {
  if (condition.category === 'attributes' && condition.value) {
    return condition.value;
  } else {
    return undefined;
  }
};

function FileAttributeCondition({
  condition,
  updateCondition,
  form,
  attributes,
  attributeList,
  setAttributeList,
}) {
  const [toggleAttribute, setToggleAttribute] = useState(false);

  const attributeExistLength = attributeList.length;
  const attributeExist = attributeList
    .filter((el) => el.name)
    .map((el) => el.name);

  useEffect(() => {
    setAttributeList([{ id: uuidv4() }]);
  }, []);

  useEffect(() => {
    updateCondition(condition.cid, {
      attributes: attributeList,
    });
  }, [attributeList]);

  useEffect(() => {
    if (attributeList.length === 0) {
      setAttributeList([{ id: uuidv4() }]);
    }
  }, [attributeList.length]);

  let currentTemplate;
  let templateOptions;

  if (attributes.length > 0) {
    templateOptions = attributes.map((el) => {
      if (el.name === condition.name) {
        currentTemplate = el;
      }
      return <Option value={el.name}>{el.name}</Option>;
    });
  }

  const onChangeAttribute = (e) => {
    let valueNameList;
    if (attributeList[0].name) {
      valueNameList = attributeList.map(el => {
        return `${el.name}_${el.type}`
      })
      form.resetFields(valueNameList);
      setAttributeList([{ id: uuidv4() }]);
    }
    setToggleAttribute(e.target.checked);
  };

  const addAttribute = () => {
    setAttributeList([...attributeList, { id: uuidv4() }]);
  };

  const updateAttribute = (id, value) => {
    const ind = attributeList.map((el) => el.id).indexOf(id);
    const newAttributeList = [...attributeList];
    newAttributeList[ind] = { ...attributeList[ind], ...value };
    setAttributeList(newAttributeList);
  };

  const removeAttribute = (id) => {
    setAttributeList(attributeList.filter((el) => el.id !== id));
  };

  if (attributes.length > 0) {
    return (
      <div style={{ width: '100%', flex: 1 }}>
        <div style={{ display: 'flex' }}>
          <Form.Item
            label="Template Name"
            style={{ width: '180px', marginRight: 16 }}
          >
            <Select
              value={condition.name}
              defaultValue={condition.name}
              onChange={(value) => {
                updateCondition(condition.cid, {
                  name: value,
                  attributes: [],
                });

                // reset form items when change template name
                if (attributeList.length > 0) {
                  attributeList.map((el) => {
                    if (el.name) {
                      const attributeType = currentTemplate.attributes.filter(
                        (a) => a.name === el.name,
                      )[0].type;
                      form.resetFields([`${el.name}_${attributeType}`]);
                    }
                  });
                }
                setAttributeList([{ id: uuidv4() }]);
                setToggleAttribute(false);
              }}
            >
              {templateOptions}
            </Select>
          </Form.Item>

          {currentTemplate.attributes.length ? (
            <Form.Item style={{ alignSelf: 'flex-end' }}>
              <Checkbox checked={toggleAttribute} onChange={onChangeAttribute}>
                Add Attribute
              </Checkbox>
            </Form.Item>
          ) : (
            <p
              style={{
                marginTop: '30px',
                whiteSpace: 'nowrap',
                color: '#FF0000',
              }}
            >
              This template doesn't have any attribute!
            </p>
          )}
        </div>

        {toggleAttribute &&
          attributeList.length > 0 &&
          attributeList.map((el, index) => {
            if (el.name) {
              const attributeType = currentTemplate.attributes.filter(
                (a) => a.name === el.name,
              )[0].type;
              let valueOptions;
              currentTemplate.attributes.forEach((item) => {
                if (item.name === el.name) {
                  if (item.type === 'multiple_choice') {
                    const options = item.value ? item.value.split(',') : [];
                    valueOptions = options.map((opt) => (
                      <Option value={opt}>{opt}</Option>
                    ));
                  }
                }
              });
              return (
                <>
                  <div style={{ display: 'flex' }}>
                    <Form.Item
                      label="Attribute Name"
                      name={`attributeName_${el.id}`}
                      style={{ width: '180px', marginRight: 16 }}
                      rules={[
                        {
                          required: true,
                          message: 'Attribute Name is required!',
                        },
                      ]}
                    >
                      <Select
                        value={el.name}
                        placeholder="Select Attribute Name"
                        onChange={(value) => {
                          updateAttribute(el.id, {
                            name: value,
                          });

                          form.resetFields([`${el.name}_${attributeType}`]);
                        }}
                      >
                        {currentTemplate.attributes.map((el) => (
                          <Option
                            key={el.name}
                            value={el.name}
                            disabled={attributeExist.includes(el.name)}
                          >
                            {el.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    {attributeType === 'text' ? (
                      <Form.Item
                        label="Condition"
                        style={{ width: '150px', marginRight: '16px' }}
                      >
                        <Select
                          value={el.condition}
                          // defaultValue="contain"
                          onChange={(value) => {
                            updateAttribute(el.id, { condition: value });
                          }}
                        >
                          <Option value="contain">Contains</Option>
                          <Option value="equal">Equals</Option>
                        </Select>
                      </Form.Item>
                    ) : (
                      <Form.Item style={{ width: '90px' }}>
                        <p style={{ marginBottom: '8px' }}>Condition</p>
                        <p style={{ marginLeft: '5px', fontWeight: '600' }}>
                          Equals to
                        </p>
                      </Form.Item>
                    )}
                    {attributeType === 'multiple_choice' ? (
                      <Form.Item
                        label="Values"
                        name={`${el.name}_${attributeType}`}
                        style={{ flex: 1 }}
                        rules={[
                          {
                            required: true,
                          },
                        ]}
                      >
                        <Select
                          mode="multiple"
                          showArrow
                          placeholder="Enter Value"
                          value={condition.value}
                          onChange={(value) => {
                            // updateCondition(condition.cid, {
                            //   value: value,
                            // });
                            updateAttribute(el.id, {
                              value: value,
                              type: 'multiple_choice',
                              condition: 'contain',
                            });
                          }}
                        >
                          {valueOptions}
                        </Select>
                      </Form.Item>
                    ) : (
                      <Form.Item
                        label="Values"
                        name={`${el.name}_${attributeType}`}
                        style={{ flex: 1 }}
                        rules={[
                          {
                            required: true,
                          },
                        ]}
                      >
                        <Input
                          placeholder="Enter Value"
                          onChange={(e) =>
                            updateAttribute(el.id, {
                              value: e.target.value.trim(),
                              type: 'text',
                            })
                          }
                        ></Input>
                      </Form.Item>
                    )}
                    <div
                      style={{
                        width: '50px',
                        marginTop: '25px',
                        marginRight: '-61px',
                        zIndex: 10,
                      }}
                    >
                      <CloseCircleFilled
                        style={{
                          fontSize: 21,
                          cursor: 'pointer',
                          verticalAlign: 'middle',
                          marginLeft: 15,
                          padding: '5px 0px',
                          height: '25px',
                        }}
                        onClick={() => {
                          removeAttribute(el.id);
                          form.resetFields([
                            `${el.name}_${attributeType}`,
                            `attributeName_${el.id}`,
                          ]);
                        }}
                      />
                    </div>
                  </div>
                </>
              );
            } else if (!el.name && attributeList.length > 1) {
              return (
                <>
                  <div style={{ display: 'flex' }}>
                    <Form.Item
                      label="Attribute Name"
                      name={`attributeName_${el.id}`}
                      rules={[
                        {
                          required: true,
                          message: 'Attribute Name is required!',
                        },
                      ]}
                      style={{ width: '180px', marginRight: 16 }}
                    >
                      <Select
                        placeholder="Select Attribute Name"
                        onChange={(value) => {
                          updateAttribute(el.id, {
                            name: value,
                            condition: 'contain',
                          });
                        }}
                      >
                        {currentTemplate.attributes.map((el) => (
                          <Option
                            key={el.name}
                            value={el.name}
                            disabled={attributeExist.includes(el.name)}
                          >
                            {el.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <div
                      style={{
                        display: 'flex',
                        flex: 1,
                        justifyContent: 'flex-end',
                        marginTop: '25px',
                        marginRight: '-48px',
                        zIndex: 10,
                      }}
                    >
                      <CloseCircleFilled
                        style={{
                          fontSize: 21,
                          cursor: 'pointer',
                          verticalAlign: 'middle',
                          marginLeft: 15,
                          padding: '5px 0px',
                          height: '25px',
                        }}
                        onClick={() => {
                          removeAttribute(el.id);
                          form.resetFields([`attributeName_${el.id}`]);
                        }}
                      />
                    </div>
                  </div>
                </>
              );
            } else if (!el.name && attributeList.length === 1) {
              return (
                <div style={{ display: 'flex' }}>
                    <Form.Item
                      label="Attribute Name"
                      name={`attributeName_${el.id}`}
                      rules={[
                        {
                          required: true,
                          message: 'Attribute Name is required!',
                        },
                      ]}
                      style={{ width: '180px', marginRight: 16 }}
                    >
                      <Select
                        placeholder="Select Attribute Name"
                        onChange={(value) => {
                          updateAttribute(el.id, {
                            name: value,
                            condition: 'contain',
                          });
                        }}
                      >
                        {currentTemplate.attributes.map((el) => (
                          <Option
                            key={el.name}
                            value={el.name}
                            disabled={attributeExist.includes(el.name)}
                          >
                            {el.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>
              )
            }
          })}
        {toggleAttribute &&
        attributeExistLength < currentTemplate.attributes.length ? (
          <div style={{ marginBottom: '16px' }}>
            <Button
              icon={<PlusOutlined />}
              style={{ borderRadius: '6px' }}
              onClick={addAttribute}
            >
              Add Attribute Name
            </Button>
          </div>
        ) : null}
      </div>
    );
  } else {
    return (
      <div style={{ display: 'flex' }}>
        <Form.Item
          label="Template Name"
          name="template_name"
          rules={[
            {
              required: true,
              message: 'Template Name is required!',
            },
          ]}
          style={{ width: '180px', marginRight: 16 }}
        >
          <Select></Select>
        </Form.Item>
        <p style={{ marginTop: '30px' }}>
          This project doesn't have any template!
        </p>
      </div>
    );
  }
}

export default FileAttributeCondition;
