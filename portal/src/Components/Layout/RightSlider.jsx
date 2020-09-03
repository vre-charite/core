import React from "react";
import { Layout } from "antd";

const { Sider } = Layout;

export default class RightSlider extends React.Component {
    render() {
        return (
            <Sider
                collapsed={true}
                reverseArrow={true}
                trigger={null}
                theme="light"
            >
                {this.props.children}
            </Sider>
        );
    }

}

