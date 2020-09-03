import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUploadItemCreator, updateClearIdCreator } from '../Redux/actions';
import { namespace, ErrorMessager } from '../ErrorMessages';
import { checkPendingStatusAPI } from '../APIs';
import _ from 'lodash';
import Promise from 'bluebird';

export default function uploadPendingListener(Component) {
    const uploadList = useSelector(state => state.uploadList);
    const clearId = useSelector(state => state.clearId);
    const dispatch = useDispatch();

    const setRefreshConfirmation = (arr) => {
        const uploadingArr = arr.filter((item) => item.status === 'uploading');
        const confirmation = function (event) {
            return window.confirm(
                'You will loss your uploading progress. Are you sure to exit?',
            );
        };
        if (uploadingArr.length > 0) {
            // window.addEventListener('beforeunload',confirmation);
            window.onbeforeunload = confirmation;
            //window.onbeforeunload = confirmation;
        } else {
            window.onbeforeunload = () => { };
        }
    };

    const updatePendingStatus = (arr) => {
        clearInterval(clearId);
        const pendingArr = arr.filter((item) => item.status === 'pending');
        if (pendingArr.length === 0) {
            return;
        }
        const newClearId = window.setInterval(() => {
            Promise.map(pendingArr, (item, index) => {
                checkPendingStatusAPI(item.projectId, item.taskId)
                    .then((res) => {
                        const { status } = res.data.result;
                        if (status === 'success' || status === 'error') {
                            item.status = status;
                            //always remember to put redux creator in the connect function !!!!!
                            dispatch(updateUploadItemCreator(item));
                            if (status === 'error') {
                                const errorMessager = new ErrorMessager(
                                    namespace.dataset.files.processingFile,
                                );
                                errorMessager.triggerMsg(null, null, item);
                            }
                        }
                    })
                    .catch((err) => {
                        if (err.response && parseInt(err.response.status) !== 404) {
                            console.log(err.response, 'error response in checking pending');
                        }
                    });
            });
        }, 4000);
        dispatch(updateClearIdCreator(newClearId));
    };

    const debouncedUpdatePendingStatus = _.debounce(updatePendingStatus, 5000, {
        leading: true,
        trailing: true,
        maxWait: 15 * 1000,
    });

    useEffect(() => {
        debouncedUpdatePendingStatus(uploadList);
        setRefreshConfirmation(uploadList)
    }, [uploadList])

    return class extends React.Component{
        render(){
            return <Component></Component>
        }
    }
}