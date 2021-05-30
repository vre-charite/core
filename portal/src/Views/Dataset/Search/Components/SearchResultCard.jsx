import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Tag, Tooltip } from 'antd';
import styles from '../index.module.scss';
import {
  getHighlightedText,
  locationMap,
  getFileSize,
} from '../../../../Utility';
import _ from 'lodash';

function SearchResultCard({ record, searchConditions }) {
  const attributeConditions = searchConditions.find(
    (el) => el.category === 'attributes',
  );
  const attributeList = attributeConditions
    ? attributeConditions.attributes
    : [];
  const info = record.source;
  const attributes = info.attributes;
  const tags = info.tags;
  const zone = info.zone;
  const path = info.path;
  const location = locationMap(info.fullPath);

  const uploadTime = moment(info.timeCreated * 1000).format(
    'YYYY-MM-DD HH:mm:ss',
  );
  const hightLightTemplateName = (name) => {
    if (
      searchConditions.find((el) => el.category === 'attributes') &&
      searchConditions.find((el) => el.category === 'attributes')['name']
    ) {
      return getHighlightedText(
        info.attributes[0].name,
        searchConditions.find((el) => el.category === 'attributes')['name'],
      );
    } else {
      return <p>{name}</p>;
    }
  };

  return (
    <div className={styles.search_result_card}>
      <div className="search-item-left">
        <div className={styles.search_item_header}>
          <div
            style={{
              width: '25%',
              display: 'flex',
              whiteSpace: 'nowrap',
              marginRight: '10px',
            }}
          >
            <span className="row-label">File Name:</span>
            {searchConditions.find((el) => el.category === 'file_name') &&
            searchConditions.find((el) => el.category === 'file_name')[
              'keywords'
            ] ? (
              getHighlightedText(
                info.fileName,
                searchConditions.find((el) => el.category === 'file_name')[
                  'keywords'
                ],
              )
            ) : (
              <>
                {info.fileName.length > 10 ? (
                  <Tooltip title={info.fileName}>
                    <span className="file-name-val">
                      {info.fileName.replace(/\s/g, '\u00a0')}
                    </span>
                  </Tooltip>
                ) : (
                  <span className="file-name-val">
                    {info.fileName.replace(/\s/g, '\u00a0')}
                  </span>
                )}
              </>
            )}
          </div>
          <div style={{ width: '22%', whiteSpace: 'nowrap', display: 'flex' }}>
            <span className="time-label">Uploaded Time:</span>
            <span className="file-name-val">
              {uploadTime.length > 10 ? (
                <Tooltip title={uploadTime}>
                  <span className="file-name-val">{uploadTime}</span>
                </Tooltip>
              ) : (
                <span className="file-name-val">{uploadTime}</span>
              )}
            </span>
          </div>
          <div style={{ width: '20%', whiteSpace: 'nowrap' }}>
            <span className="uploader-label">Uploaded By:</span>
            {searchConditions.find((el) => el.category === 'uploader') &&
            searchConditions.find((el) => el.category === 'uploader')[
              'keywords'
            ] ? (
              getHighlightedText(
                info.uploader,
                _.lowerCase(
                  searchConditions.find((el) => el.category === 'uploader')[
                    'keywords'
                  ],
                ),
              )
            ) : (
              <>
                <span className="file-name-val">{info.uploader}</span>
              </>
            )}
          </div>
          <div style={{ flex: 1, whiteSpace: 'nowrap' }}>
            <span className="size-label">File Size:</span>
            <span className="file-name-val">
              {info.fileSize ? getFileSize(info.fileSize) : 0}
            </span>
          </div>
        </div>

        {attributes && attributes.length ? (
          <div className="manifest-row">
            <span className="row-label_FileAttribute">File Attribute:</span>
            <ul className="manifest-val">
              <li style={{ display: 'flex', flexDirection: 'column' }}>
                <h4>Template Name</h4>
                {hightLightTemplateName(attributes[0].name)}
              </li>
              <li>
                <h4>Attribute Name</h4>
                {attributes.map((el) => {
                  const attributeNameList = attributeList
                    .filter((attribute) => attribute.name)
                    .map((attribute) => attribute.name);
                  if (attributeNameList.includes(el.attributeName)) {
                    return (
                      <p>
                        <b>{el.attributeName}</b>
                      </p>
                    );
                  } else {
                    return <p>{el.attributeName}</p>;
                  }
                })}
              </li>
              <li>
                <h4>Value</h4>
                {attributes.map((el) => {
                  if (el.value && Array.isArray(el.value)) {
                    const searchCondition = attributeList.some(
                      (attribute) => attribute.name === el.attributeName,
                    );
                    if (searchCondition)
                      return (
                        <p>
                          <b>{el.value[0]}</b>
                        </p>
                      );
                    return <p>{el.value[0]}</p>;
                  } else {
                    const searchCondition = attributeList.find(
                      (attribute) => attribute.name === el.attributeName,
                    );

                    if (searchCondition && el.value)
                      return getHighlightedText(
                        el.value,
                        searchCondition.value,
                      );

                    return <p>{el.value}</p>;
                  }
                })}
              </li>
            </ul>
          </div>
        ) : (
          <div className="manifest-row"></div>
        )}

        {tags && tags.length ? (
          <div className="tags-row">
            <span className="row-label">Tags:</span>
            <div className="tags-val">
              {tags.map((el) => {
                const searchedTag = searchConditions.find(
                  (el) => el.category === 'tags',
                );
                if (
                  searchedTag &&
                  searchedTag.keywords &&
                  searchedTag.keywords.includes(el)
                ) {
                  return <Tag className="highlight">{el}</Tag>;
                }
                return <Tag>{el}</Tag>;
              })}
            </div>
          </div>
        ) : (
          <div className="tags-row"></div>
        )}
      </div>
      <div className={styles.search_item_right}>
        <span>
          Location:{' '}
          {location.length > 30 ? (
            <Tooltip title={location}>
              <b>{location}</b>
            </Tooltip>
          ) : (
            <b>{location}</b>
          )}
        </span>
      </div>
    </div>
  );
}

export default SearchResultCard;
