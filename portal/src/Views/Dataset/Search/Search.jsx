import React, { useState, useEffect } from 'react';
import { Button, Layout } from 'antd';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { withCurrentProject, toFixedNumber } from '../../../Utility';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import SearchConditions from './Components/SearchConditions';
import SearchResultTable from './Components/SearchResultTable';
import { searchFilesAPI } from '../../../APIs';

const { Content } = Layout;
function Search(props) {
  const dispatch = useDispatch();
  const { t } = useTranslation(['formErrorMessages']);
  let { datasetId } = useParams();
  const [conditions, setConditions] = useState([]);
  const [searchConditions, setSearchConditions] = useState([]);
  const [files, setFiles] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState([
    { category: 'zone', value: 'greenroom' },
  ]);
  const [loading, setLoading] = useState(false);
  const [attributeList, setAttributeList] = useState([]);

  const username = useSelector((state) => state.username);

  const permission = props.containerDetails.permission;

  const queryTransformer = (condition) => {
    switch (condition.category) {
      case 'file_name':
        return {
          value: condition.keywords,
          condition: condition.condition,
        };
      case 'uploader':
        return {
          value: condition.keywords,
          condition: condition.condition,
        };
      case 'time_created':
        return {
          value: condition.calendar,
          condition: condition.condition,
        };
      case 'file_size':
        let fileSize = Number(condition.value);
        let fileSize2 = Number(condition.value2);
        if (condition.unit === 'kb') fileSize = fileSize * 1024;
        if (condition.unit === 'mb') fileSize = fileSize * 1024 * 1024;
        if (condition.unit === 'gb') fileSize = fileSize * 1024 * 1024 * 1024;

        if (fileSize2) {
          if (condition.unit === 'kb') fileSize2 = fileSize2 * 1024;
          if (condition.unit === 'mb') fileSize2 = fileSize2 * 1024 * 1024;
          if (condition.unit === 'gb')
            fileSize2 = fileSize2 * 1024 * 1024 * 1024;

          return {
            value: [toFixedNumber(fileSize), toFixedNumber(fileSize2)],
            condition: condition.condition,
          };
        }

        return {
          value: [toFixedNumber(fileSize)],
          condition: condition.condition,
        };
      case 'tags':
        return {
          value: condition.keywords,
          condition: condition.condition,
        };
      case 'attributes':
        const containAttributes = attributeList.some((el) => el.name);
        const attributes =
          containAttributes &&
          attributeList &&
          attributeList.map((el) => {
            return {
              attribute_name: el.name,
              value: el.value,
              type: el.type,
              condition: el.condition,
            };
          });
        return {
          name: condition.name,
          attributes: attributes || [],
        };
      case 'zone':
        return {
          value: condition.value,
          condition: 'equal',
        };
    }
  };

  const searchFiles = (pagination = {}) => {
    setLoading(true);
    const query = {};
    for (const condition of conditions) {
      const payload = queryTransformer(condition);
      query[condition.category] = payload;
    }

    for (const filter of filters) {
      const payload = queryTransformer(filter);
      query[filter.category] = payload;
    }

    query['archived'] = {
      value: false,
      condition: 'equal',
    };

    if (permission === 'contributor') {
      query['uploader'] = {
        value: username,
        condition: 'equal',
      };
      query['zone'] = {
        value: 'greenroom',
        condition: 'equal',
      };
    } else if (permission === 'collaborator') {
      if (query['zone']['value'] === 'greenroom') {
        query['uploader'] = {
          value: username,
          condition: 'equal',
        };
      }
    }
    searchFilesAPI({ query, ...pagination }, datasetId).then((res) => {
      setFiles(res.data.result);
      setTotal(res.data.total);
      setLoading(false);
    });
  };

  useEffect(() => {
    const validCondition = conditions.filter((el) => el.category);
    if (validCondition.length) searchFiles({ page, pageSize }, filters);
  }, [filters]);

  const onTableChange = (pagination) => {
    const page = pagination.current - 1;
    const pageSize = pagination.pageSize;

    setPage(page);
    setPageSize(pageSize);

    const paginationParams = {
      page,
      page_size: pageSize,
    };

    searchFiles(paginationParams, filters);
  };

  const resetConditions = () => {
    setConditions([{ cid: uuidv4() }]);
    setFilters([{ category: 'zone', value: 'greenroom' }]);
    setTotal(0);
    setFiles([]);
    setPage(0);
  };

  return (
    <>
      <div
        style={{
          margin: '17px 17px 0px 17px',
          borderRadius: 8,
          boxShadow: '0px 3px 6px #0000001A',
          background: 'white',
          letterSpacing: '0.2px',
          minHeight: '720px',
        }}
      >
        <div
          style={{
            borderBottom: '1px solid #f1f1f1',
            height: 45,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2
            style={{
              color: '#003262',
              height: '45px',
              lineHeight: '45px',
              margin: '0 25px',
              width: '100%',
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 'bold' }}>Search</span>
            <div style={{ float: 'right' }}>
              <span
                style={{
                  fontSize: 14,
                  marginRight: 22,
                  verticalAlign: 'middle',
                }}
              >
                Result
              </span>
              <b style={{ fontSize: 20, verticalAlign: 'middle' }}>{total}</b>
            </div>
          </h2>
          <Button
            type="primary"
            style={{
              marginRight: '20px',
              borderRadius: '6px',
              height: '30px',
              width: '70px',
              marginTop: '3px',
            }}
            onClick={() => resetConditions()}
          >
            Reset
          </Button>
        </div>
        <SearchConditions
          conditions={conditions}
          setConditions={setConditions}
          searchFiles={searchFiles}
          permission={permission}
          attributeList={attributeList}
          setAttributeList={setAttributeList}
          searchConditions={searchConditions}
          setSearchConditions={setSearchConditions}
          setPage={setPage}
          setPageSize={setPageSize}
        />
        <SearchResultTable
          files={files}
          conditions={conditions}
          page={page}
          setPage={setPage}
          total={total}
          onTableChange={onTableChange}
          pageSize={pageSize}
          setFilters={setFilters}
          filters={filters}
          loading={loading}
          searchFiles={searchFiles}
          permission={permission}
          attributeList={attributeList}
          searchConditions={searchConditions}
          setSearchConditions={setSearchConditions}
        />
      </div>
    </>
  );
}
export default withCurrentProject(Search);
