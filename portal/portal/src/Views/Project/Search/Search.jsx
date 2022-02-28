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
import _ from 'lodash';

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
  const [greenRoomTotal, setGreenRoomTotal] = useState('');
  const [coreTotal, setCoreTotal] = useState('');
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState([
    { category: 'zone', value: 'greenroom' },
  ]);
  const [loading, setLoading] = useState(false);
  const [attributeList, setAttributeList] = useState([]);
  const [filesQuery, setFilesQuery] = useState({});
  const [lastSearchQuery, setLastSearchQuery] = useState('');

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
    let query = {};
    let newQuery = {};
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
      query['display_path'] = {
        value: username,
        condition: 'start_with',
      };
      query['zone'] = {
        value: 'greenroom',
        condition: 'equal',
      };
    } else if (permission === 'collaborator') {
      if (query['zone']['value'] === 'greenroom') {
        query['display_path'] = {
          value: username,
          condition: 'start_with',
        };
      }
    }

    setFilesQuery(query);

    // handle the search when click on search button
    searchFilesAPI(
      { query, ...pagination },
      props.currentProject.globalEntityId,
    ).then((res) => {      
      setFiles(res.data.result);
      if (query['zone']['value'] === 'greenroom') {
        setGreenRoomTotal(res.data.total);
      } else if (query['zone']['value'] === 'core') {
        setCoreTotal(res.data.total);
      }
      setLoading(false);

      if (query['zone']['value'] === 'greenroom') {
        newQuery = _.cloneDeep(query);
        newQuery['zone']['value'] = 'core';
        if (permission === 'collaborator') {
          // collaborator can check all files/folders in core
          delete newQuery['display_path'];
        }
      } else if (query['zone']['value'] === 'core') {
        newQuery = _.cloneDeep(query);
        newQuery['zone']['value'] = 'greenroom';
        if (permission === 'collaborator') {
          newQuery['display_path'] = {
            value: username,
            condition: 'start_with',
          };
        }
      }
      // this api call is to get greenroom/core total number
      setLastSearchQuery(newQuery);
      searchFilesAPI(
        { query: newQuery, ...pagination },
        props.currentProject.globalEntityId,
      ).then((res) => {
        if (newQuery['zone']['value'] === 'greenroom') {
          setGreenRoomTotal(res.data.total);
        } else if (newQuery['zone']['value'] === 'core') {
          setCoreTotal(res.data.total);
        }
      });
    });
  };

  const switchLocation = (pagination = {}) => {
    // handle the search when switch on green room and core locations.
    let newLastSearchQuery = _.cloneDeep(lastSearchQuery);

    for (const filter of filters) {
      const payload = queryTransformer(filter);
      newLastSearchQuery[filter.category] = payload;
    }

    setFilesQuery(newLastSearchQuery);

    let newQuery = {};
    searchFilesAPI(
      { query: newLastSearchQuery, ...pagination },
      props.currentProject.globalEntityId,
    ).then((res) => {
      setFiles(res.data.result);
      if (newLastSearchQuery['zone']['value'] === 'greenroom') {
        setGreenRoomTotal(res.data.total);
      } else if (newLastSearchQuery['zone']['value'] === 'core') {
        setCoreTotal(res.data.total);
      }
      setLoading(false);
      if (newLastSearchQuery['zone']['value'] === 'greenroom') {
        newQuery = _.cloneDeep(newLastSearchQuery);
        newQuery['zone']['value'] = 'Core';
        if (permission === 'collaborator') {
          delete newQuery['display_path'];
        }
      } else if (newLastSearchQuery['zone']['value'] === 'core') {
        newQuery = _.cloneDeep(newLastSearchQuery);
        //newQuery['zone']['value'] = 'greenroom';
        if (permission === 'collaborator') {
          newQuery['display_path'] = {
            value: username,
            condition: 'start_with',
          };
        }
      }

      // this api call is to get greenroom/core total number
      /* setLastSearchQuery(newQuery);
      searchFilesAPI(
        { query: newQuery, ...pagination },
        props.currentProject.globalEntityId,
      ).then((res) => {
        if (newQuery['zone']['value'] === 'greenroom') {
          setGreenRoomTotal(res.data.total);
        } else if (newQuery['zone']['value'] === 'core') {
          setCoreTotal(res.data.total);
        }
      }); */
    });
  };

  useEffect(() => {
    const validCondition = conditions.filter((el) => el.category);
    if (validCondition.length && lastSearchQuery !== '') switchLocation();
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
    setGreenRoomTotal('');
    setCoreTotal('');
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
          <p
            style={{
              color: '#003262',
              fontSize: 16,
              fontWeight: 'bold',
              margin: '0px 0px 0px 20px',
            }}
          >
            Search
          </p>
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
          greenRoomTotal={greenRoomTotal}
          coreTotal={coreTotal}
          filesQuery={filesQuery}
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
          greenRoomTotal={greenRoomTotal}
          coreTotal={coreTotal}
        />
      </div>
    </>
  );
}
export default withCurrentProject(Search);
