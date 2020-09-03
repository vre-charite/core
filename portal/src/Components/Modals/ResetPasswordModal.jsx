import React, { useState, useEffect } from 'react';
import { Modal, Button, message, Form, Input } from 'antd';
import PasswordValidator from 'password-validator';
import axios from 'axios';

import { resetPasswordAPI } from '../../APIs';
import { namespace, ErrorMessager } from '../../ErrorMessages';

const ResetPasswordModal = (props) => {
	const [userInfo, setUserInfo] = useState({})
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const info = { username: props.username };
		setUserInfo(info);
	}, [props.visible, props.username])

	const FormInstance = React.createRef();

	const onFinish = values => {
		console.log('Success:', values);
	};
	
	const onFinishFailed = errorInfo => {
		console.log('Failed:', errorInfo);
	};

	const onCancel = () => {
		props.handleCancel();
		FormInstance.current.resetFields();
	}

	const onOk = () => {
		setLoading(true);

		FormInstance.current
			.validateFields()
			.then((values) => {
				if (values.password === values.newPassword || values.newPassword !== values.newPassword2) {
					setLoading(false);
					return;
				}

				resetPasswordAPI({
					old_password: values.password,
					new_password: values.newPassword,
					username: props.username,
				})
					.then(res => {
						if (res && res.status === 200) {
							message.success('Reset password successfully')
							setLoading(false);	
							props.handleCancel();
							FormInstance.current.resetFields();		
						}
					})
					.catch(err => {
						if (err.response) {
							const errorMessager = new ErrorMessager(namespace.login.resetPassword);
							errorMessager.triggerMsg(err.response.status);
						}

						setLoading(false);
					})
			})
			.catch((error) => {
				setLoading(false);
			});
	}

	return (
		<Modal 
			title="Reset Password"
			visible={props.visible}
			onCancel={onCancel}
			onOk={onOk}
			footer={[
				<Button key="back" onClick={onCancel}>
					Close
				</Button>,
				<Button
					key="submit"
					type="primary"
					loading={loading}
					onClick={onOk}
				>
					Submit
				</Button>,
			]}
		>
			<Form
				layout="vertical"
				name="basic"
				initialValues={userInfo}
				onFinish={onFinish}
				onFinishFailed={onFinishFailed}
				ref={FormInstance}
			>
				<Form.Item
					label="Username"
					name="username"
					rules={[{ required: true, message: 'Please input your username!' }]}
				>
					<Input disabled />
				</Form.Item>

				<Form.Item
					label="Old Password"
					name="password"
					rules={[{ required: true, message: 'Please input your password!' }]}
				>
					<Input.Password 
						onCopy={(e) => e.preventDefault()} 
						onPaste={(e) => e.preventDefault()} 
						autocomplete="off" 
					/>
				</Form.Item>

				<Form.Item
					label="New Password"
					name="newPassword"
					rules={[
						{
							required: true,
							message: 'Please input your password',
							whitespace: true,
						},
						{
							validator(rule, value) {
								const schema = new PasswordValidator();
								schema
									.is()
									.min(8) // Minimum length 8
									.is()
									.max(16) // Maximum length 100
									.has()
									.uppercase() // Must have uppercase letters
									.has()
									.lowercase() // Must have lowercase letters
									.has()
									.digits(1) // Must have at least 1 digits
									.has()
									.symbols(1)
									.has()
									.not()
									.spaces(); // Should not have spaces

								const result = schema.validate(value);
								if (result) {
									return Promise.resolve();
								} else {
									return Promise.reject(
										'The password should be 8-16 characters, at least 1 uppercase, 1 lowercase, 1 number and 1 symbol',
									);
								}
							},
						},
						({ getFieldValue }) => ({
							validator(rule, value) {
								if (!value || getFieldValue('password') !== value) {
									return Promise.resolve();
								}

								return Promise.reject(
									'New password can not be the same as the old password',
								);
							},
						}),
					]}
				>
					<Input.Password 
						onCopy={(e) => e.preventDefault()} 
						onPaste={(e) => e.preventDefault()} 
						autocomplete="off" 
					/>
				</Form.Item>

				<Form.Item
					label="Confirm Password"
					name="newPassword2"
					rules={[
						{
							required: true,
							message: 'Please confirm your password!',
						},

						({ getFieldValue }) => ({
							validator(rule, value) {
								if (!value || getFieldValue('newPassword') === value) {
									return Promise.resolve();
								}

								return Promise.reject(
									'The two passwords that you entered do not match!',
								);
							},
						}),
					]}
				>
					<Input.Password 
						onCopy={(e) => e.preventDefault()} 
						onPaste={(e) => e.preventDefault()} 
						autocomplete="off" 
					/>
				</Form.Item>
			</Form>
		</Modal>
	)
}

export default ResetPasswordModal