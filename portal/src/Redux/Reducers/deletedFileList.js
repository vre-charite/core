
import { SET_DELETE_LIST } from '../actionTypes';

const init = [];

function deletedFileList(state = init, action) {
  const { type, payload } = action;

	switch (type) {
		case SET_DELETE_LIST:
			return payload;
		default: {
			return state;
		}
	}
}

export default deletedFileList;