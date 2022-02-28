const MIN_MARGIN = 480;

export const hideButton = (actionBarRef, moreActionRef) => {
  if (!actionBarRef || !actionBarRef.current) {
    return 0;
  }
  if (!moreActionRef || !moreActionRef.current) {
    return 0;
  }
  const actionBar = actionBarRef.current;

  const fullWidth = actionBar.offsetWidth;
  const allButtons = actionBar.querySelectorAll(
    '.file_explorer_header_bar > button',
  );
  const allButtonsLength = allButtons.length - 1; // the "..." is not count;

  let totalWidth = 0;
  let hideIndex = allButtonsLength;
  for (let i = 0; i < allButtons.length; i++) {
    const button = allButtons[i];
    if (i === 0) {
      totalWidth += button.offsetLeft;
    }

    totalWidth += 54 + 7.2 * button.innerText.length;

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
