import React from "react";
import { Checkbox, Form } from "antd";

function DynamicCheck(props) {
    function onChange(checkedValues) {
        console.log("checked = ", checkedValues);
    }
    return (
        <>
            <Form.Item
                label={<strong>{props.name}</strong>}
                name={props.name}
                key={`check-${props.index}`}
            >
                <Checkbox.Group options={props.options} onChange={onChange} />
            </Form.Item>
        </>
    );
}
export default DynamicCheck;
