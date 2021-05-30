import React from 'react';

export const getHighlightedText = (text, highlight) => {
  /*  console.log("This is text!");
  console.log(text);
  console.log("This is highlight!");
  console.log(highlight); */
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
export const hightLightCaseInsensitive = (text, highlight) => {
  console.log(text.replace(new RegExp(highlight, 'gi'), (str) => <b>{str}</b>));
  return (
    <span className="file-name-val">
      {text.replace(new RegExp(highlight, 'gi'), (str) => (
        <b>{str}</b>
      ))}
    </span>
  );
};
