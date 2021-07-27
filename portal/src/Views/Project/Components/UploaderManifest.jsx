import React, { useEffect } from 'react';
import { Form, Select } from 'antd';
import ManifestForm from '../../../Components/Form/Manifest/ManifestForm';
import styles from './index.module.scss';
const { Option } = Select;
const UploaderManifest = function (props) {
  const [form] = Form.useForm();
  useEffect(() => {
    if (props.selManifest == null) {
      form.resetFields();
    }
  }, [props.selManifest]);

  return (
    <>
      <Form layout="vertical" form={form}>
        <Form.Item name="manifest" label="File Attribute">
          <Select
            className={styles.inputBorder}
            allowClear={true}
            style={{ width: 200 }}
            onChange={(value) => {
              if (!value) {
                props.setSelManifest(null);
                return;
              }
              const selM = props.manifestList.find(
                (man) => man.id === Number(value),
              );
              props.setSelManifest(selM);
            }}
            value={props.selManifest ? props.selManifest.id : null}
          >
            {props.manifestList.map((man) => (
              <Option key={man.id}>{man.name}</Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
      {props.selManifest && (
        <div
          style={{
            margin: '0 -24px',
            padding: '30px 0',
            background: '#E6F5FF',
            maxHeight: 195,
            overflowY: 'scroll',
          }}
        >
          <ManifestForm
            manifest={props.selManifest}
            attrForm={props.attrForm}
            setAttrForm={props.setAttrForm}
          />
        </div>
      )}
    </>
  );
};
export default UploaderManifest;
