import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TranslateCode from '../Pages/TranslateCode'; // Assuming the component file is in the same directory
import { act } from 'react-dom/test-utils'; // Import act from react-dom/test-utils

// Mock global fetch function
global.fetch = jest.fn();

describe('TranslateCode Component', () => {
  test('There isnt any input code error', async () => {
    const { getByText, getAllByText, getByRole, getByLabelText } = render(<TranslateCode />);

    // Select language for source and target
    fireEvent.click(getByRole('button', { name: /Source Language/i }));
    const sourceLanguage = 'Python';
    const sourceLanguageElements = getAllByText(sourceLanguage);
    sourceLanguageElements.forEach(element => {
      fireEvent.click(getByRole('button', { name: /Source Language/i }));
      fireEvent.click(element);
    });
    fireEvent.click(getByRole('button', { name: /Target Language/i }));
    const targetLanguage = 'Java';
    const targetLanguageElements = getAllByText(targetLanguage);
    targetLanguageElements.forEach(element => {
      fireEvent.click(getByRole('button', { name: /Target Language/i }));
      fireEvent.click(element);
    });
    const aceEditor= document.querySelector('.ace_editor');
    aceEditor.focus();
    fireEvent.keyDown(aceEditor, { key: 'End' });
    for (let i = 0; i < 999; i++) {
      fireEvent.keyDown(aceEditor, { key: 'Backspace' });
    }
    fireEvent.click(getByText('Convert'));


    // Check for error message
    await waitFor(() =>
      expect(getByText('Error')).toBeInTheDocument()
    );
  });
  const clipboardWriteTextMock = jest.fn(() => Promise.reject(new Error('Clipboard copy error')));

  beforeEach(() => {
    // Replace navigator.clipboard.writeText with the mock function
    global.navigator.clipboard = {
      writeText: clipboardWriteTextMock
    };
    global.fetch.mockReset();

  });

  afterEach(() => {
    // Restore the original implementation after each test
    delete global.navigator.clipboard;
  });

  test('handles translation timeout', async () => {
    // Mock the fetch call to simulate timeout
    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({}),
        ok: false,
        status: 500, // Simulating a server error
      })
    );

    const { getByText } = render(<TranslateCode />);
    fireEvent.click(getByText('Convert')); // Trigger the conversion

    // Ensure that the error message for timeout is displayed
    await waitFor(() => {
      expect(getByText('Error')).toBeInTheDocument();
    });
  });

  test('handles clipboard copy input error', async () => {
    const { getByTitle, getByText } = render(<TranslateCode />);

    fireEvent.click(getByTitle(/CopyInput/));

    await waitFor(() => expect(getByText(/An error occurred while copying input code: Clipboard copy error/)).toBeInTheDocument());
  });

  test('Source and target languages cannot be the same error', async () => {
    const { getByText, getAllByText, getByRole } = render(<TranslateCode />);

    // Select same language for source and target
    fireEvent.click(getByRole('button', { name: /Source Language/i }));
    const sourceLanguage = 'Python';
    const sourceLanguageElements = getAllByText(sourceLanguage);
    sourceLanguageElements.forEach(element => {
      fireEvent.click(getByRole('button', { name: /Source Language/i }));
      fireEvent.click(element);
    });
    fireEvent.click(getByRole('button', { name: /Target Language/i }));
    const targetLanguage = 'Python';
    const targetLanguageElements = getAllByText(targetLanguage);
    targetLanguageElements.forEach(element => {
      fireEvent.click(getByRole('button', { name: /Target Language/i }));
      fireEvent.click(element);
    });

    // Trigger conversion
    fireEvent.click(getByText('Convert'));

    // Check for error message
    await waitFor(() =>
      expect(getByText('Source and target languages cannot be the same')).toBeInTheDocument()
    );
  });

 
  

  // Reset fetch mock for other API error tests
  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'API error' })
      })
    );
  });

  test('API error', async () => {
    const { getByText } = render(<TranslateCode />);

    // Perform actions that trigger translation
    fireEvent.click(getByText('Convert'));

    // Wait for API error alert to be displayed
    await waitFor(() =>
      expect(getByText('API Error')).toBeInTheDocument()
    );
  });

  test('Rate limit exceeded error', async () => {
    // Mock the fetch call to return a Promise that resolves with a 429 status code
    jest.spyOn(global, 'fetch').mockImplementation(() => {
      return Promise.resolve({
        status: 429,
        json: () => Promise.resolve({ message: 'Rate Limit Exceeded' }),
      });
    });
  
    const { getByText } = render(<TranslateCode />);
    
    // Perform actions that trigger translation
    fireEvent.click(getByText('Convert'));
  
    // Wait for rate limit exceeded error alert to be displayed
    await waitFor(() =>
      expect(getByText('Error')).toBeInTheDocument()
    );
  
    // Restore the original fetch implementation
    global.fetch.mockRestore();
  });
  
  

  test('Both source and target languages are required error', async () => {
    const { getByText } = render(<TranslateCode />);

    // Trigger conversion without selecting source and target languages
    fireEvent.click(getByText('Convert'));

    // Check for error message
    await waitFor(() =>
      expect(getByText('Both source and target languages are required')).toBeInTheDocument()
    );
  });

  test('Preprocessing error', async () => {
    const { getByText, getAllByText, getByRole } = render(<TranslateCode />);

    // Select same language for source and target
    fireEvent.click(getByRole('button', { name: /Source Language/i }));
    const sourceLanguage = 'Python';
    const sourceLanguageElements = getAllByText(sourceLanguage);
    sourceLanguageElements.forEach(element => {
      fireEvent.click(getByRole('button', { name: /Source Language/i }));
      fireEvent.click(element);
    });
    fireEvent.click(getByRole('button', { name: /Target Language/i }));
    const targetLanguage = 'Java';
    const targetLanguageElements = getAllByText(targetLanguage);
    targetLanguageElements.forEach(element => {
      fireEvent.click(getByRole('button', { name: /Target Language/i }));
      fireEvent.click(element);
    });

    // Trigger conversion
    fireEvent.click(getByText('Convert'));

    // Check for error message
    await waitFor(() =>
      expect(getByText('Error')).toBeInTheDocument()
    );
});
});
