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
