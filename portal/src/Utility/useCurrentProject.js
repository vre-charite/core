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

import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { store } from '../Redux/store'
import _ from 'lodash';

/**
 * 
 */
function useCurrentProject() {
    const { containersPermission } = useSelector(state => state);
    const { datasetId } = useParams();
    if (!datasetId) {
        return [undefined];
    }
    const currentProject = _.find(containersPermission, (item) => {
        return parseInt(item.id) === parseInt(datasetId);
    });
    return [currentProject]
}

/**
 * return a high order component which has the current project as the prop
 * @param {React.ClassicComponent} WrappedComponent 
 * @returns {JSX.Element}
 */
function withCurrentProject(WrappedComponent) {
    return function (props) {
        const [currentProject] = useCurrentProject();
        return <WrappedComponent {...props} currentProject={currentProject} />
    }
}

/**
 * get the current project in either functional and class component
 * @param {number|string} datasetId 
 * @returns {object|undefined} return current project if exist
 */
function getCurrentProject(datasetId) {
    if ((typeof datasetId !== 'number') && (typeof datasetId !== 'string')) {
        throw new Error('parameter datasetId is required')
    }
    const { containersPermission } = store.getState();
    if (!containersPermission || !datasetId) {
        return undefined;
    }
    const currentProject = _.find(containersPermission, (item) => {
        return parseInt(item.id) === parseInt(datasetId);
    });
    return currentProject;
}

export { useCurrentProject, withCurrentProject, getCurrentProject }