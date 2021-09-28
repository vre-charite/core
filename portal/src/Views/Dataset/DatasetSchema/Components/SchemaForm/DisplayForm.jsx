import React, { useState, useEffect } from 'react';
function renderObjectWithAnyOf(schemaTPL, formData) {
  const formDataKeys = Object.keys(formData);
  for (let i = 0; i < schemaTPL['anyOf'].length; i++) {
    const schemaOpt = schemaTPL['anyOf'][i];
    const schemaOptKeys = Object.keys(schemaOpt.properties);
    const result = formDataKeys.every((val) => schemaOptKeys.includes(val));
    if (result) {
      return Object.keys(formData).map((key) => {
        return (
          <div className="display-form-lineitem">
            <label>{schemaOpt.properties[key].title}</label>
            <p>
              {formData[key] ? formData[key] : 'N/A'}
            </p>
          </div>
        );
      });
    }
  }
}
function renderObject(schemaTPL, formData, uiSchema) {
  // add support for "anyOf" here
  if (schemaTPL['anyOf']) {
    return renderObjectWithAnyOf(schemaTPL, formData);
  }
  if (schemaTPL['properties']) {
    const schemaKeys = Object.keys(schemaTPL['properties']);
    if (uiSchema['ui:order'] && uiSchema['ui:order'].length) {
      schemaKeys.sort((key1, key2) => {
        const ind1 = uiSchema['ui:order'].indexOf(key1);
        const ind2 = uiSchema['ui:order'].indexOf(key2);
        return ind1 - ind2;
      });
    }
    return schemaKeys.map((key) => {
      const schemaTPLNode = schemaTPL['properties'][key];
      if (schemaTPLNode['type'] == 'object') {
        return (
          <div className="display-form-lineitem">
            <DisplayForm
              formData={formData[key]}
              schemaTPL={schemaTPLNode}
              uiSchema={uiSchema}
            ></DisplayForm>
          </div>
        );
      }
      if (schemaTPLNode['type'] == 'array') {
        if (schemaTPLNode['items']['type'] === 'object') {
          return (
            <div className="display-form-lineitem">
              {schemaTPLNode['title'] ? (
                <label>{schemaTPLNode['title']}</label>
              ) : null}
              {formData[key] &&
              formData[key].length &&
              typeof formData[key].map !== 'undefined' ? (
                formData[key].map((listItem) => {
                  return (
                    <DisplayForm
                      formData={listItem}
                      uiSchema={uiSchema}
                      schemaTPL={schemaTPLNode['items']}
                    ></DisplayForm>
                  );
                })
              ) : (
                <p>N/A</p>
              )}
            </div>
          );
        } else {
          return (
            <div className="display-form-lineitem">
              <label>{schemaTPLNode['title']}</label>
              <div>
                {formData[key] &&
                formData[key].length &&
                typeof formData[key].map !== 'undefined'
                  ? formData[key].map((v) => (
                      <span
                        className="tag-value"
                        style={{ margin: '6px 6px 0px 0px' }}
                      >
                        {v}
                      </span>
                    ))
                  : 'N/A'}
              </div>
            </div>
          );
        }
      }
      return (
        <div className="display-form-lineitem">
          <label>{schemaTPLNode['title']}</label>
          <p style={{ marginLeft: '15px' }}>
            {formData[key] ? formData[key] : 'N/A'}
          </p>
        </div>
      );
    });
  } else {
    return Object.keys(formData).map((key) => {
      return (
        <div className="display-form-lineitem">
          <label>{key}</label>
          <p>
            {formData[key] ? formData[key] : 'N/A'}
          </p>
        </div>
      );
    });
  }
}

export default function DisplayForm({ formData, schemaTPL, uiSchema }) {
  if (schemaTPL['type'] === 'array') {
    return (
      <div className="display-form">
        {formData.length && typeof formData.map !== 'undefined' ? (
          formData.map((listItem) => {
            return (
              <DisplayForm
                formData={listItem}
                uiSchema={uiSchema}
                schemaTPL={schemaTPL['items']}
              ></DisplayForm>
            );
          })
        ) : (
          <p style={{marginLeft: '15px'}}>N/A</p>
        )}
      </div>
    );
  } else if (schemaTPL['type'] === 'object') {
    return (
      <div className="display-form">
        {renderObject(schemaTPL, formData, uiSchema)}
      </div>
    );
  } else {
    // number or string or boolean or null type
    return (
      <div className="display-form">
        <label>{schemaTPL['title']}</label>
        <p>{formData ? formData : 'N/A'}</p>
      </div>
    );
  }
}
