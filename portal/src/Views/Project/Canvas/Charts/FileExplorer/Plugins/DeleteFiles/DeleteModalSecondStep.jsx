import React from 'react';

export function DeleteModalSecondStep({ locked }) {
  return (
    <>
      <p>
        The following {locked.length} file(s)/folder(s) will be skipped because
        there are concurrent file operations are taking place:
      </p>
      {locked && locked.length ? (
        <ul style={{ maxHeight: 90, overflowY: 'auto' }}>
          {locked.map((v) => {
            return <li key={v}>{v}</li>;
          })}
        </ul>
      ) : null}
    </>
  );
}
