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

export const getHighlightedText = (text, highlight) => {
  // Split on highlight term and include term into parts, ignore case
  const parts = text.split(highlight);

  return (
    <span className="file-name-val">
      {' '}
      {parts.map((part, i) => {
        let divider = i < parts.length - 1 && (
          <b>{highlight.replace(/\s/g, '\u00a0')}</b>
        );
        return (
          <>
            <span>{part.replace(/\s/g, '\u00a0')}</span>
            {divider}
          </>
        );
      })}{' '}
    </span>
  );
};

// this function needs to be modified and might be used in the future
export const hightLightCaseInsensitive = (text, highlight) => {
  const regObj = new RegExp(highlight, 'gi');
  const hightlightText = <b>{highlight.toLowerCase()}</b>;
  return (
    <span className="file-name-val">
      {text.replace(regObj, hightlightText)}
    </span>
  );
};
