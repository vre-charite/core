
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