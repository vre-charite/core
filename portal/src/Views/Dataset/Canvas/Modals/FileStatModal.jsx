import React, { useState, useEffect } from 'react';
import { Timeline, Tabs,  DatePicker, Input, Form, Select, Button, Pagination, Empty } from 'antd';
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
	const [users, setUsers] = useState([moment(today).format('YYYY-MM-DD'), moment(today).format('YYYY-MM-DD')]);
	const [selectedUser, setSelectedUser] = useState(null);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	
	const { datasetId, currentUser, isAdmin } = props

	useEffect(() => {
		if (isAdmin) {
			getUsersOnDatasetAPI(datasetId).then((res) => {
				const result = objectKeysToCamelCase(res.data.result)
				setUsers(result);
	
				setSelectedUser(currentUser);
				form.setFieldsValue({ user: currentUser });
				form.setFieldsValue({ date: [moment(today, dateFormat), moment(today, dateFormat)] });
				form.setFieldsValue({ action: 'upload' });
	
				projectFileSummary(datasetId, isAdmin, { user: currentUser, page: 0, action: 'upload' }).then((res) => {
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

	const disabledDate = current => {
		return current && current >= moment().endOf('day');
	  };

	const onFinish = (values) => {
		const params = {};

		const date = values.date;

		if (moment(today).format('YYYY-MM-DD') !== moment(date[0]).format('YYYY-MM-DD') || moment(date[0]).format('YYYY-MM-DD') !== moment(today).format('YYYY-MM-DD')) {
			params['startDate'] = moment(date[0]).subtract(1, 'days').format('YYYY-MM-DD');
			params['endDate'] = moment(date[1]).add(1, 'days').format('YYYY-MM-DD');	

			setDateRange([moment(date[0]).format('YYYY-MM-DD'), moment(date[1]).format('YYYY-MM-DD')]);
		}

		params.user = values.user;
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
		params.user = selectedUser;

		if (moment(today).format('YYYY-MM-DD') !== dateRange[0] ||dateRange[1] !== moment(today).format('YYYY-MM-DD')) {
			params.startDate = moment(dateRange[0]).subtract(1, 'days').format('YYYY-MM-DD');
			params.endDate = moment(dateRange[1]).add(1, 'days').format('YYYY-MM-DD');
		}

		params.page = page - 1;
		// params.size = 10;

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
						name="horizontal_login"
						layout="inline"
						onFinish={onFinish}
					>
						<Form.Item
							name="date"
							rules={[{ required: true, message: 'Please select a date range!' }]}
						>
							<RangePicker 
								disabledDate={disabledDate} 
							/>
						</Form.Item>

						<Form.Item
							name="user"
							rules={[{ required: true, message: 'Please input user you want to search!' }]}
						>
							<Select style={{ width: 150 }}>
								{userOptions}
							</Select>
						</Form.Item>

						<Form.Item
							name="action"
							rules={[{ required: true, message: 'Please select action!' }]}
						>
							<Select style={{ width: 110 }}>
								<Option value="upload">Upload</Option>
								<Option value="download">Download</Option>
							</Select>
						</Form.Item>

						<Form.Item shouldUpdate={true}>
							{() => (
								<div>
									<Button
										type="primary"
										htmlType="submit"
									>
										Search
									</Button>

									<Button
										style={{ marginLeft: 10 }}
										onClick={onReset}
									>
										Reset
									</Button>
								</div>
							)}
						</Form.Item>
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