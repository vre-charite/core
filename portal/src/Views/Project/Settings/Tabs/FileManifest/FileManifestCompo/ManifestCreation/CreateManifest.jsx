// Copyright 2022 Indoc Research
// 
// Licensed under the EUPL, Version 1.2 or – as soon they
// will be approved by the European Commission - subsequent
// versions of the EUPL (the "Licence");
// You may not use this work except in compliance with the
// Licence.
// You may obtain a copy of the Licence at:
// 
// https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
// 
// Unless required by applicable law or agreed to in
// writing, software distributed under the Licence is
// distributed on an "AS IS" basis,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
// express or implied.
// See the Licence for the specific language governing
// permissions and limitations under the Licence.
// 

import React, { useState } from 'react';
import { Button, Input, message } from 'antd';
import CreateManifestTable from './CreateManifestTable';
import {
  addNewManifest,
  addNewAttrsToManifest,
} from '../../../../../../../APIs';
import { useCurrentProject } from '../../../../../../../Utility';
import { validateManifestName } from '../../Utils/FormatValidators';
import i18n from '../../../../../../../i18n';
import styles from '../../../../index.module.scss';
function CreateManifest(props) {
  const [newManifestName, setNewManifestName] = useState('');
  const [currentDataset] = useCurrentProject();
  const [createdAttrs, setCreatedAttrs] = useState([]);
  const [createdStep, setCreatedStep] = useState(1);
  const [createdLoading, setCreatedLoading] = useState(false);
  const [editMode, setEditMode] = useState('default');
  function emptyCreateForm() {
    setNewManifestName('');
    setCreatedAttrs([]);
    setCreatedStep(1);
  }
  return (
    <div>
      {createdStep === 1 ? (
        <div style={{ textAlign: 'center' }}>
          <span
            style={{
              marginRight: 20,
              color: 'rgba(0,0,0,0.45)',
              fontWeight: 'bold',
            }}
          >
            Attribute Template Name
          </span>
          <Input
            style={{ width: 150, borderRadius: 6 }}
            value={newManifestName}
            onChange={(e) => {
              setNewManifestName(e.target.value);
            }}
          />
        </div>
      ) : null}

      {createdStep === 2 ? (
        <div style={{ marginTop: 10 }}>
          <h4
            style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: 'rgba(0,0,0,0.65)',
              margin: '10px 0 20px',
              textAlign: 'center',
            }}
          >
            Define Attributes For Template
          </h4>
          <CreateManifestTable
            editMode={editMode}
            setEditMode={setEditMode}
            createdAttrs={createdAttrs}
            setCreatedAttrs={setCreatedAttrs}
          />
        </div>
      ) : null}

      <div style={{ marginTop: 20, textAlign: 'center' }}>
        {createdStep === 1 ? (
          <Button
            type="primary"
            className={styles.button}
            onClick={(e) => {
              const { valid, err } = validateManifestName(
                newManifestName,
                props.manifestList,
              );
              if (!valid) {
                message.error(err);
                return;
              }
              setCreatedStep(2);
            }}
          >
            Next Step
          </Button>
        ) : null}

        {createdStep === 2 ? (
          <Button
            type="primary"
            loading={createdLoading}
            onClick={async (e) => {
              if (editMode !== 'default') {
                message.error(
                  `${i18n.t(
                    'formErrorMessages:manifestSettings.manifestAttrs.saved',
                  )}`,
                );
                return;
              }

              if (createdAttrs.length === 0) {
                message.error(
                  `${i18n.t(
                    'formErrorMessages:manifestSettings.manifestAttrs.empty',
                  )}`,
                );
                return;
              }
              //
              setCreatedLoading(true);
              const res = await addNewManifest(
                newManifestName,
                currentDataset.code,
              );
              const manifestId = res.data.result.id;
              const params = createdAttrs.map((attr) => {
                return {
                  name: attr.name,
                  projectCode: attr.project_code,
                  type: attr.type,
                  value: attr.value,
                  manifestId,
                  optional: attr.optional,
                };
              });
              await addNewAttrsToManifest(params);
              await props.loadManifest();
              setCreatedLoading(false);
              props.setIsCreateManifest(false);
              emptyCreateForm();
            }}
          >
            Create
          </Button>
        ) : null}
        <Button
          type="link"
          onClick={(e) => {
            props.setIsCreateManifest(false);
            emptyCreateForm();
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
export default CreateManifest;
