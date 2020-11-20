import React, { useState, useEffect } from 'react';
import { Timeline, Tabs,  DatePicker, Row, Col, Form, Select, Button, Pagination, Empty } from 'antd';
import moment from 'moment';

import { getUsersOnDatasetAPI, projectFileSummary } from '../../../../APIs';
import { objectKeysToCamelCase } from '../../../../Utility';

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';

const FileStatModal = (props) => {
	const [form] = Form.useForm();
	const today = new Date();

	const [treeData, setTreeData] = useState([]);
	const [action, setAction] = useState('upload')
	const [dateRange, setDateRange] = useState([moment(today, dateFormat), moment(today, dateFormat)]);
	const [users, setUsers] = useState([]);
	const [selectedUser, setSelectedUser] = useState(null);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	
	const { datasetId, currentUser, isAdmin } = props

	useEffect(() => {
		if (isAdmin) {
			getUsersOnDatasetAPI(datasetId).then((res) => {
				const result = objectKeysToCamelCase(res.data.result)
				setUsers(result);
	
				setSelectedUser('all');
				form.setFieldsValue({ user: 'all' });
				form.setFieldsValue({ date: [moment(today, dateFormat), moment(today, dateFormat)] });
				form.setFieldsValue({ action: 'upload' });
	
				projectFileSummary(datasetId, isAdmin, {  page: 0, action: 'upload' }).then((res) => {
					setTreeData(res.data.result.recentUpload);
					setTotal(res.data.result.uploadCount);
				});
			});
		} else {
			setUsers([{ name: currentUser }]);
			form.setFieldsValue({ user: currentUser });
			form.setFieldsValue({ date: [moment(today, dateFormat), moment(today, dateFormat)] });
			form.setFieldsValue({ action: 'upload' });

			projectFileSummary(datasetId, isAdmin, { user: currentUser, page: 0, action: 'upload' }).then((res) => {
				setTreeData(res.data.result.recentUpload);
				setTotal(res.data.result.uploadCount);
			});
		}
	}, [datasetId]);

	const userOptions = users.map((el) => (
		<Option value={el.name}>
			{el.name}
		</Option>
	));

	if (isAdmin) userOptions.unshift(
		<Option value="all">
			All Users
		</Option>
	)

	const disabledDate = current => {
		return current && current >= moment().endOf('day');
	  };

	const onFinish = (values) => {
		const params = {};

		const date = values.date;

		if (moment(today).format('YYYY-MM-DD') !== moment(date[0]).format('YYYY-MM-DD') || moment(date[0]).format('YYYY-MM-DD') !== moment(today).format('YYYY-MM-DD')) {
			params['startDate'] = moment(date[0]).format('YYYY-MM-DD');
			params['endDate'] = moment(date[1]).add(1, 'days').format('YYYY-MM-DD');	

			setDateRange([moment(date[0]).format('YYYY-MM-DD'), moment(date[1]).format('YYYY-MM-DD')]);
		}

		if (values.user !== 'all') params.user = values.user;

		params['action'] = values.action;

		setAction(values.action);
		setSelectedUser(values.user)

		projectFileSummary(datasetId, isAdmin, params).then((res) => {
			if (values.action === 'upload') {
				setTreeData(res.data.result.recentUpload);
				setTotal(res.data.result.uploadCount);
			} else {
				setTreeData(res.data.result.recentDownload);
				setTotal(res.data.result.downloadCount);
			}
			setPage(1);
		});
	};

	const onReset = () => {
		form.resetFields();
		setTreeData([]);
	};

	const onChangePage = (page, pageSize) => {
		const params = {};
		setPage(page);

		params.action = action;
		if (selectedUser !== 'all') params.user = selectedUser;

		if (moment(today).format('YYYY-MM-DD') !== dateRange[0] ||dateRange[1] !== moment(today).format('YYYY-MM-DD')) {
			params.startDate = moment(dateRange[0]).format('YYYY-MM-DD');
			params.endDate = moment(dateRange[1]).add(1, 'days').format('YYYY-MM-DD');
		}

		params.page = page - 1;

		projectFileSummary(datasetId, isAdmin, params).then((res) => {
			if (action === 'upload') {
				setTreeData(res.data.result.recentUpload);
				setTotal(res.data.result.uploadCount);
			} else {
				setTreeData(res.data.result.recentDownload);
				setTotal(res.data.result.downloadCount);
			}
		});
	};

	return (
		<div style={{ marginBottom: 15 }}>
			<Tabs type="card">
				<TabPane tab="Search by" key="filters">
					<Form
						form={form}
						name="advanced_search"
      					style={{
							padding: 24,
							background: '#fbfbfb',
							border: '1px solid #d9d9d9',
							borderRadius: 2
						}}
						onFinish={onFinish}
					>
						<Row gutter={24}>
							<Col span={9}>
								<Form.Item
									name="date"
									rules={[{ required: true, message: 'Please select a date range!' }]}
									label="Date:"
								>
									<RangePicker 
										disabledDate={disabledDate} 
									/>
								</Form.Item>
							</Col>

							<Col span={7}>
								<Form.Item
									name="user"
									rules={[{ required: true, message: 'Please input user you want to search!' }]}
									label="User:"
								>
									<Select style={{ width: 150 }}>
										{userOptions}
									</Select>
								</Form.Item>
							</Col>

							<Col span={6}>
								<Form.Item
									name="action"
									rules={[{ required: true, message: 'Please select action!' }]}
									label="Type:"
								>
									<Select style={{ width: 110 }}>
										<Option value="upload">Upload</Option>
										<Option value="download">Download</Option>
									</Select>
								</Form.Item>
							</Col>

							<Col span={2}></Col>
						</Row>

						<Row>
							<Col span={20.5} style={{ textAlign: 'right' }}>
								<Button type="primary" htmlType="submit">
									Search
								</Button>
								<Button
									style={{ marginLeft: 30 }}
									onClick={onReset}
								>
									Clear
								</Button>
							</Col>
							<Col span={1.5}></Col>
						</Row>

						{/* <Form.Item shouldUpdate={true}>
							{() => (
								<div>
									<Button
										type="primary"
										htmlType="submit"
									>
										Search
									</Button>

									<Button
										style={{ marginLeft: 20 }}
										onClick={onReset}
									>
										Reset
									</Button>
								</div>
							)}
						</Form.Item> */}
					</Form>
				</TabPane>
			</Tabs>

			{
				treeData && treeData.length > 0 ? (
					<div>
						<Timeline 
							style={{ marginTop: 40 }}
						>
							{treeData && treeData.map((i) => {
								let { owner, createTime, fileName, downloader } = i['attributes'];
								return (
									<Timeline.Item color="green">
										{owner || downloader} {`${action}ed`} {fileName} at {createTime}
									</Timeline.Item>
								);
							})}
						</Timeline>

						<Pagination 
							total={total}
							size="small" 
							style={{ float: 'right' }} 
							onChange={onChangePage}
							showSizeChanger={false}
							current={page}
						/>
					</div>
				) : (
					<Empty
						description="No Messages"
						image={Empty.PRESENTED_IMAGE_SIMPLE}
					/>
				)
			}
		</div>
	)
};

export default FileStatModal;