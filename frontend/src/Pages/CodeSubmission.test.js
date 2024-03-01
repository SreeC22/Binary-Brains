import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import CodeTranslationForm from './CodeTranslationForm';

describe('CodeTranslationForm', () => {
  test('renders input code and target language dropdown', async () => {
    render(<CodeTranslationForm />);

    // Find input code textarea
    const inputCodeTextarea = screen.getByLabelText(/input code/i);
    expect(inputCodeTextarea).toBeInTheDocument();

    // Find target language dropdown
    const targetLanguageDropdown = screen.getByLabelText(/target language/i);
    expect(targetLanguageDropdown).toBeInTheDocument();
  });

  test('renders source language dropdown and convert button', async () => {
    render(<CodeTranslationForm />);

    // Find source language dropdown
    const sourceLanguageDropdown = screen.getByLabelText(/source language/i);
    expect(sourceLanguageDropdown).toBeInTheDocument();

    // Find convert button
    const convertButton = screen.getByText(/convert/i);
    expect(convertButton).toBeInTheDocument();
  });

  test('validates source language and target language before conversion', async () => {
    render(<CodeTranslationForm />);

    // Find convert button and click it
    const convertButton = screen.getByText(/convert/i);
    fireEvent.click(convertButton);

    // Ensure error messages are displayed for source and target languages
    await waitFor(() => {
      const sourceLanguageErrorMessage = screen.getByText(/source language is required/i);
      expect(sourceLanguageErrorMessage).toBeInTheDocument();

      const targetLanguageErrorMessage = screen.getByText(/target language is required/i);
      expect(targetLanguageErrorMessage).toBeInTheDocument();
    });
  });

  // Add more tests as needed
});
