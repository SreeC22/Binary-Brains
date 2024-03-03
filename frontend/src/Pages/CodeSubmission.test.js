import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import CodeSubmission from './CodeSubmission';

describe('CodeSubmission', () => {
  test('renders without crashing', () => {
    render(<CodeSubmission />);
  });

  test('displays error alert when converting with empty source language', async () => {
    const { getByText, getByRole } = render(<CodeSubmission />);
    const convertButton = getByText('Convert');

    fireEvent.click(convertButton);

    await waitFor(() => {
      const errorAlert = getByRole('alert');
      expect(errorAlert).toBeInTheDocument();
      expect(getByText('Both source and target languages are required')).toBeInTheDocument();
    });
  });

  test('displays error alert when converting with empty target language', async () => {
    const { getByText, getByRole, getByLabelText } = render(<CodeSubmission />);
    const convertButton = getByText('Convert');
    const sourceLanguageDropdown = getByLabelText('Source Language');

    fireEvent.click(sourceLanguageDropdown);
    fireEvent.click(getByText('Python')); // Select a source language
    fireEvent.click(convertButton);

    await waitFor(() => {
      const errorAlert = getByRole('alert');
      expect(errorAlert).toBeInTheDocument();
      expect(getByText('Target language is required')).toBeInTheDocument();
    });
  });

  test('displays error alert when converting with same source and target languages', async () => {
    const { getByText, getByRole, getByLabelText } = render(<CodeSubmission />);
    const convertButton = getByText('Convert');
    const sourceLanguageDropdown = getByLabelText('Source Language');
    const targetLanguageDropdown = getByLabelText('Target Language');

    fireEvent.click(sourceLanguageDropdown);
    fireEvent.click(getByText('Python')); // Select a source language
    fireEvent.click(targetLanguageDropdown);
    fireEvent.click(getByText('Python')); // Select the same language as source
    fireEvent.click(convertButton);

    await waitFor(() => {
      const errorAlert = getByRole('alert');
      expect(errorAlert).toBeInTheDocument();
      expect(getByText('Source and target languages cannot be the same')).toBeInTheDocument();
    });
  });

  test('does not display error alert when converting with valid input', async () => {
    const { getByText, queryByRole, getByLabelText } = render(<CodeSubmission />);
    const convertButton = getByText('Convert');
    const sourceLanguageDropdown = getByLabelText('Source Language');
    const targetLanguageDropdown = getByLabelText('Target Language');

    fireEvent.click(sourceLanguageDropdown);
    fireEvent.click(getByText('Python')); // Select a source language
    fireEvent.click(targetLanguageDropdown);
    fireEvent.click(getByText('Java')); // Select a different target language
    fireEvent.click(convertButton);

    await waitFor(() => {
      const errorAlert = queryByRole('alert');
      expect(errorAlert).not.toBeInTheDocument();
    });
  });

  // Add more tests for other functionalities and edge cases
});
