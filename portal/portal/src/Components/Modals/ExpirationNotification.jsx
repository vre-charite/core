import React, { useState, useEffect } from 'react';
import { tokenTimer } from '../../Service/keycloak';

const getText = (timeRemain, isRefreshed) => {
  if (isRefreshed) {
    return 'Your session is now refreshed!';
  } else {
    return (
      <>
        {' '}
        <span>If no more actions, Your session will expire in </span>{' '}
        <b>{timeRemain > 0 ? timeRemain : 0}</b>s{' '}
      </>
    );
  }
};

function ExpirationNotification({ getIsSessionMax, isRefreshed }) {
  const [timeRemain, setTimeRemain] = useState(
    tokenTimer.getRefreshRemainTime(),
  );
  const [isSessionMax, setIsSessionMax] = useState(getIsSessionMax());
  useEffect(() => {
    const func = () => {
      setIsSessionMax(getIsSessionMax());
      setTimeRemain(tokenTimer.getRefreshRemainTime());
    };
    const condition = () => true;
    tokenTimer.addListener({ func, condition });
    // eslint-disable-next-line
  }, []);
  const text = isSessionMax
    ? `You are reaching the max allowed session time in ${
        timeRemain > 0 ? timeRemain : 0
      }`
    : getText(timeRemain, isRefreshed);
  return <>{text}</>;
}

export default ExpirationNotification;
