import React from 'react';
import Editor from '@monaco-editor/react';

export function TxtMonacoEditor(props) {
  const { text, width, height, largeFile } = props;
  const handleEditorDidMount = (editor, monaco) => {
    const messageContribution = editor.getContribution(
      'editor.contrib.messageController',
    );
    const diposable = editor.onDidAttemptReadOnlyEdit(() => {
      messageContribution.showMessage(
        'Can not edit the preview file.',
        editor.getPosition(),
      );
      //messageContribution.closeMessage();
    });
  };
  return (
    <>
      <Editor
        height={height || 550}
        width={width}
        defaultLanguage="plaintext"
        defaultValue={text}
        options={{
          readOnly: true,
          minimap: {
            enabled: true,
          },
        }}
        onMount={handleEditorDidMount}
      />
      {largeFile && (
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            width: '94%',
            transform: 'translateX(-50%)',
            height: 35,
            background: '#F0F0F0',
          }}
        >
          <p
            style={{
              fontSize: 12,
              color: '#818181',
              height: '35px',
              lineHeight: '35px',
              margin: 0,
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          >
            To view more please download the file
          </p>
        </div>
      )}
    </>
  );
}
