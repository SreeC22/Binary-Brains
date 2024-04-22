// __mocks__/react-monaco-editor.js

module.exports = jest.fn().mockImplementation(() => {
    return {
      render: jest.fn(),
      dispose: jest.fn()
    };
  });
  