const React = require('react');
const { render, fireEvent, waitFor, screen } = require('@testing-library/react');
const CodeSubmission = require('./CodeSubmission');

describe('CodeSubmission', () => {
  test('renders input code and target language dropdown', async () => {
    render(React.createElement(CodeSubmission));

    // Find input code textarea
    const inputCodeTextarea = screen.getByLabelText('Input Code');
    expect(inputCodeTextarea).toBeInTheDocument();

    // Find target language dropdown
    const targetLanguageDropdown = screen.getByLabelText('Target Language');
    expect(targetLanguageDropdown).toBeInTheDocument();
  });

  test('renders source language dropdown and convert button', async () => {
    render(React.createElement(CodeSubmission));

    // Find source language dropdown
    const sourceLanguageDropdown = screen.getByLabelText('Source Language');
    expect(sourceLanguageDropdown).toBeInTheDocument();

    // Find convert button
    const convertButton = screen.getByText('Convert');
    expect(convertButton).toBeInTheDocument();
  });

  test('validates source language and target language before conversion', async () => {
    render(React.createElement(CodeSubmission));

    // Find convert button and click it
    const convertButton = screen.getByText('Convert');
    fireEvent.click(convertButton);

    // Ensure error messages are displayed for source and target languages
    await waitFor(() => {
      const sourceLanguageErrorMessage = screen.getByText('Source language is required');
      expect(sourceLanguageErrorMessage).toBeInTheDocument();

      const targetLanguageErrorMessage = screen.getByText('Target language is required');
      expect(targetLanguageErrorMessage).toBeInTheDocument();
    });
  });

  // Add more tests as needed
});
