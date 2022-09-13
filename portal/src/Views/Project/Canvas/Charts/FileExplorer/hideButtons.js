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
