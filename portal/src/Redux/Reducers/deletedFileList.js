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


import { SET_DELETE_LIST, UPDATE_DELETE_LIST } from '../actionTypes';
import datasetList from './datasetList';

const init = [];

function deletedFileList(state = init, action) {
  const { type, payload } = action;

	switch (type) {
		case SET_DELETE_LIST:
			return payload;
		case UPDATE_DELETE_LIST:
			const deleteList = state;

			for (const updated of payload) {
				for (const item of deleteList) {
					if (updated.fileName === item.fileName) {
						item.status = updated.status;
						item.action = 'data_delete';
					} else {
						const isExist = deleteList.find(el => el.fileName === updated.fileName);

						updated.action = 'data_delete';
						if (!isExist) deleteList.push(updated);
					}
				}
			}

			return deleteList;
		default: {
			return state;
		}
	}
}

export default deletedFileList;