/*
 * @Description:
 * @Author: Ivana
 * @Date: 2019-10-16 15:16:10
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2019-12-17 10:23:22
 */
import React, { Component } from "react";
import { Card } from "antd";
import styles from "./index.module.scss";

export default class InfoCard extends Component {
    render() {
        const { icon } = this.props;
        const imgUrl = require(`../../Images/icons/${icon}.svg`);
        return (
            <Card className={styles.infocard}>
                <img src={imgUrl} alt="icon" />
                <h4> {this.props.title} </h4>
                <p> {this.props.desc} </p>
            </Card>
        );
    }
}
