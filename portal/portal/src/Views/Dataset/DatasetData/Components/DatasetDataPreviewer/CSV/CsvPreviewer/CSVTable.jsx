import React, { useState, useEffect } from 'react';
import styles from './CsvPreviewer.module.scss';
import { Pagination } from 'antd';
export function CsvTable(props) {
  const pageSize = 1000;
  const [pageNo, setPageNo] = useState(0);
  if (!props.csvData || !props.csvData.length) {
    return null;
  }
  function pageNoChange(page) {
    setPageNo(page - 1);
  }
  const pageHeader = props.csvData[0];
  const startInd = 1 + pageNo * pageSize;
  const totalNum = props.csvData.length - 1;
  const pageData = props.csvData.slice(startInd, startInd + pageSize);
  return props.csvData && props.csvData.length ? (
    <div className={styles['csv-table-wrapper']}>
      {!props.largeFile && totalNum > pageSize && (
        <Pagination
          simple
          defaultCurrent={pageNo + 1}
          total={totalNum}
          pageSize={pageSize}
          onChange={pageNoChange}
        />
      )}

      <table>
        <tr key="header">
          {pageHeader.map((v, ind) => (
            <th key={'header-th-' + ind}>{v}</th>
          ))}
        </tr>
        {pageData.map((row, ind) => {
          return (
            <tr key={'body-tr-' + ind}>
              {row.map((v, vind) => (
                <td key={'body-tr-' + ind + '-' + vind}>{v}</td>
              ))}
            </tr>
          );
        })}
      </table>
      {props.largeFile && (
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            width: '94%',
            transform: 'translateX(-50%)',
            height: 35,
            background: '#F0F0F0',
          }}
        >
          <p
            style={{
              fontSize: 12,
              color: '#818181',
              height: '35px',
              lineHeight: '35px',
              margin: 0,
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          >
            To view more please download the file
          </p>
        </div>
      )}
    </div>
  ) : null;
}
