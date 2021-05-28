const MIN_MARGIN = 480;

export const hideButton = (actionBarRef, moreActionRef) => {
  const actionBar = actionBarRef.current;
  if (!actionBar) {
    return 0;
  }
  const fullWidth = actionBar.offsetWidth;
  const allButtons = actionBar.querySelectorAll(
    '.file_explorer_header_bar > button',
  );
  const allButtonsLength = allButtons.length - 1; // the "..." is not count;
  const visibleButtons = [...allButtons].filter((ele) => {
    const style = window.getComputedStyle(ele);
    return (
      (style.display !== 'none' || style.visibility !== 'hidden') &&
      ele.id !== 'action-dropdown'
    );
  });
  let totalWidth = 0;
  let hideIndex = allButtonsLength;
  for (let i = 0; i < visibleButtons.length; i++) {
    const button = visibleButtons[i];
    if (i === 0) {
      totalWidth += button.offsetLeft;
    }
    totalWidth += button.offsetWidth;
    if (MIN_MARGIN > fullWidth - totalWidth) {
      hideIndex = i;
      break;
    }
  }

  for (let i = 0; i < allButtonsLength; i++) {
    const button = allButtons[i];
    if (i <= hideIndex) {
      button.style.display = 'inline-block';
    } else {
      button.style.display = 'none';
    }
  }
  const moreAction = moreActionRef.current;
  if (hideIndex + 1 >= allButtonsLength) {
    moreAction.style && (moreAction.style.display = 'none');
  } else {
    moreAction.style && (moreAction.style.display = 'inline-block');
  }

  return allButtonsLength - hideIndex - 1;
};
