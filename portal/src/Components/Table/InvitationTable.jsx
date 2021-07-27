import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import TableWrapper from './TableWrapper';
import { getInvitationsAPI } from '../../APIs';
import { timeConvert, partialString } from '../../Utility';
import { namespace, ErrorMessager } from '../../ErrorMessages';
import _ from 'lodash';
import moment from 'moment';

/**
 * Takes one prop: projectId. If projetId is given, the component will fetch the invitations on this proejct and not deisplay the project name
 *
 * @param {*} props
 * @returns
 */
function InvitationTable(props) {
  const [invitations, setInvitations] = useState(null);
  const [filters, setFilters] = useState({
    page: 0,
    pageSize: 10,
    orderBy: 'create_timestamp',
    orderType: 'desc',
    filters: {},
  });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState([]);
  const allProjects = useSelector((state) => state.containersPermission);

  useEffect(() => {
    if (props.projectId) {
      const filtersWithProject = filters;
      filtersWithProject.filters.projectId =
        props.currentProject.globalEntityId;
      setFilters(filtersWithProject);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchInvitations();
    // eslint-disable-next-line
  }, [filters, props.totalInvitations]);

  const fetchInvitations = () => {
    getInvitationsAPI(filters)
      .then((res) => {
        const { page, result, total } = res.data;
        setInvitations(result);
        setTotal(total);
        setPage(page);
      })
      .catch((err) => {
        const errorMessager = new ErrorMessager(
          namespace.userManagement.getInvitationsAPI,
        );
        errorMessager.triggerMsg(err.response.status);
      });
  };

  const onChange = async (pagination, filterParam, sorter) => {
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

    if (filterParam.email && filterParam.email.length > 0) {
      searchText.push({
        key: 'email',
        value: filterParam.email[0],
      });

      newFilters.filters['email'] = filterParam.email[0];
    } else {
      delete newFilters.filters['email'];
    }

    if (filterParam.invited_by && filterParam.invited_by.length > 0) {
      searchText.push({
        value: filterParam.invited_by[0],
        key: 'invited_by',
      });

      newFilters.filters['invited_by'] = filterParam.invited_by[0];
    } else {
      delete newFilters.filters['invited_by'];
    }

    //Sorters
    if (sorter && sorter.order) {
      if (sorter.columnKey) {
        if (sorter.columnKey === 'email') {
          //This is a comproimsing soution to sort emails.
          // Might need BE updates later
          newFilters.orderBy = 'invitation_detail';
        } else {
          newFilters.orderBy = sorter.columnKey;
        }
      }
      newFilters.orderType = sorter.order === 'ascend' ? 'asc' : 'desc';
    }

    if (sorter && !sorter.order) {
      newFilters = {
        ...newFilters,
        orderBy: 'create_timestamp',
        orderType: 'desc',
      };
    }

    setFilters(newFilters);
    setSearchText(searchText);
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
  };

  const handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    let filters = searchText;
    filters = filters.filter((el) => el.key !== dataIndex);
    setSearchText(filters);
  };

  const invitationColumns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: true,
      width: '30%',
      searchKey: 'email',
    },
    {
      title: 'Invited Time',
      dataIndex: 'createTimestamp',
      key: 'create_timestamp',
      sorter: true,
      width: '20%',
      render: (text) => text && timeConvert(text, 'datetime'),
    },
    {
      title: 'Invited By',
      dataIndex: 'invitedBy',
      key: 'invited_by',
      sorter: true,
      width: '15%',
      searchKey: 'invited_by',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '14%',
      render: (text, record) => {
        if (text === 'pending') {
          return 'Pending';
        } else {
          return 'Completed';
        }
      },
    },
  ];
  if (!props.projectId) {
    const projectColumn = {
      title: 'Project',
      dataIndex: 'projectId',
      key: 'project',
      width: '20%',
      render: (text) => {
        const string =
          _.find(allProjects, (p) => p.id === parseInt(text))?.name ||
          'No Project Assigned';

        if (string.length < 20) {
          return <span>{string}</span>;
        } else {
          return partialString(string, 20, true);
        }
      },
    };
    invitationColumns.splice(invitationColumns.length - 1, 0, projectColumn);
  }
  const getExpired = (record) => {
    const isExpired = record.status !== 'pending';
    return isExpired ? 'disabled' : ' ';
  };
  return (
    <TableWrapper
      columns={invitationColumns}
      onChange={onChange}
      handleReset={handleReset}
      handleSearch={handleSearch}
      dataSource={invitations}
      totalItem={total}
      pageSize={pageSize}
      page={page}
      setClassName={getExpired}
      {...props}
    />
  );
}

export default InvitationTable;
