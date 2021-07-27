import React from 'react';
import Editor from '@monaco-editor/react';

export function JsonMonacoEditor(props) {
  const { json, width, height, format } = props;
  const handleEditorDidMount = (editor, monaco) => {
    /*     monaco.editor.defineTheme('my-theme', {
          base: 'vs-dark',
          inherit: true,
          rules: [],
          colors: {
            'editor.background': '#FFFFFF',
          },
        });
        monaco.editor.setTheme('my-theme'); */
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
        defaultLanguage="json"
        defaultValue={formatJson(json)}
        options={{
          readOnly: true,
          minimap: {
            enabled: true,
          },
        }}
        onMount={handleEditorDidMount}
      />
      {!format && (
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

//https://stackoverflow.com/questions/3515523/javascript-how-to-generate-formatted-easy-to-read-json-straight-from-an-object
const formatJson = (json) => {
  return JSON.stringify(json, null, 4); // Indented 4 spaces
};
