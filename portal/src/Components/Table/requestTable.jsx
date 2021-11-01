import React , { useState, useEffect } from 'react';
import TableWrapper from './TableWrapper';
import { connect } from 'react-redux';
import { getResourceRequestsAPI, approveResourceRequestAPI } from '../../APIs';
import {
  setServiceRequestRedDot,
} from '../../Redux/actions';
import { timeConvert } from '../../Utility';
import { namespace, ErrorMessager } from '../../ErrorMessages/index';
import { Button } from 'antd';

const ServiceRequestTable = (props) => {
  const [requests, setRequests] = useState(null);
  const [filters, setFilters] = useState({
    page: 0,
    pageSize: 10,
    orderBy: 'request_date',
    orderType: 'desc',
    filters: {},
  });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState([]);


  const getResourceRequests = async (filters) => {
    const {page: tablePage, pageSize, orderBy, orderType, filters: tableFilters} = filters;
    try {
      const res = await getResourceRequestsAPI(filters);
      if (
        // alway set the latest request id to localStorage
        // set the first request id to localStorage only when the filters are default to get the first page info.
        res.data.result.length &&
        Object.keys(tableFilters).length === 0 &&
        tablePage === 0 &&
        pageSize === 10 &&
        orderBy === 'request_date' &&
        orderType === 'desc'
      ) {
        localStorage.setItem('serviceRequestId', res.data.result[0].id);
      }
      props.setServiceRequestRedDot(false);
      const { page, result, total } = res.data;
      setRequests(result);
      setTotal(total);
      setPage(page);
    } catch(error) {
      const errorMessager = new ErrorMessager(
        namespace.userManagement.getServiceRequestAPI,
      );
      //errorMessager.triggerMsg(error.response.status);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line

    getResourceRequests(filters);
  }, [filters]);

  const completeRequest = async (requestId) => {
    await approveResourceRequestAPI(requestId);
    getResourceRequests(filters);
  }

  const onChange = (pagination, filter, sorter) => {
    let newFilters = Object.assign({}, filters);

    //Pagination
    setPage(pagination.current - 1);
    newFilters.page = pagination.current - 1;

    if (pagination.pageSize) {
      setPageSize(pagination.pageSize);
      newFilters.pageSize = pagination.pageSize;
    }

    //Search
    let searchText = [];

    if (filter.username && filter.username.length > 0) {
      searchText.push({
        key: 'username',
        value: filter.username[0]
      });

      newFilters.filters['username'] = filter.username[0];
    } else {
      delete newFilters.filters['username'];
    }
    
    if (filter.email && filter.email.length > 0) {
      searchText.push({
        key: 'email',
        value: filter.email[0],
      });

      newFilters.filters['email'] = filter.email[0];
    } else {
      delete newFilters.filters['email'];
    }

    //Sorters
    if (sorter && sorter.order) {
      if (sorter.columnKey) {
          newFilters.orderBy = sorter.columnKey;
      }
      newFilters.orderType = sorter.order === 'ascend' ? 'asc' : 'desc';
    }

    if (sorter && !sorter.order) {
      newFilters = {
        ...newFilters,
        orderBy: 'request_date',
        orderType: 'desc',
      }
    }

    setFilters(newFilters);
    setSearchText(searchText);
  }

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
  };

  const handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    let filters = searchText;
    filters = filters.filter((el) => el.key !== dataIndex);
    setSearchText(filters);
  };

  const columns = [
    {
      title: 'Account',
      dataIndex: 'username',
      key: 'username',
      sorter: true,
      width: '15%',
      searchKey: 'username',
      render: (text) => {
        return <span style={{ wordBreak: 'break-word' }}>{text}</span>;
      },
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: true,
      width: '20%',
      searchKey: 'email',
    },
    {
      title: 'Project',
      dataIndex: 'projectName',
      key: 'project_name',
      sorter: true,
      width: '15%',
    },
    {
      title: 'Request Date',
      dataIndex: 'requestDate',
      key: 'request_date',
      sorter: true,
      width: '15%',
      render: (text) => text && timeConvert(text, 'datetime'),
    },
    {
      title: 'Request for',
      dataIndex: 'requestFor',
      key: 'request_for',
      sorter: true,
      width: '10%',
    },
    {
      title: 'Permission',
      dataIndex: 'active',
      key: 'active',
      sorter: true,
      width: '10%',
      render: (text, record) => {
        if (text === true) {
          return <Button 
          type="primary" 
          style={{borderRadius: '6px'}}
          onClick={() => completeRequest(record.id)}
          >Complete</Button>
        } else {
          return <span>Completed</span>
        }
      }
    },
    {
      title: 'Completed on',
      dataIndex: 'completeDate',
      key: 'complete_date',
      sorter: true,
      width: '15%',
      render: (text) => {
        if (text !== "None") {
          return timeConvert(text, 'datetime');
        } else {
          return '';
        }
      },
    },
  ];

  return (
    <TableWrapper
      columns={columns}
      onChange={onChange}
      handleReset={handleReset}
      handleSearch={handleSearch}
      dataSource={requests}
      totalItem={total}
      pageSize={pageSize}
      page={page}
    />
  );
};

const mapStateToProps = (state) => {
  return {
    showRedDot: state.serviceRequestRedDot.showRedDot,
  }
}

export default connect(mapStateToProps, { setServiceRequestRedDot })(ServiceRequestTable);
