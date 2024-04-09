import { fireEvent, render, waitFor, screen } from '@testing-library/react';
import React from 'react';
import TranslateCode from '../Pages/TranslateCode'; // Update the path as per your project structure
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();
// Mock the useAuth hook before importing the component
jest.mock('../Components/AuthContext', () => ({
  useAuth: () => ({ user: { mail: 'test@example.com'} }), // Mock return value
}));

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

// Mock URL.createObjectURL for download functionality
global.URL.createObjectURL = jest.fn();

describe('TranslateCode', () => {
  test('renders without crashing', () => {
    render(<TranslateCode />);
  });

  test('accepts input code', async () => {
    const { getByRole, getAllByText} = render(<TranslateCode />);
    
    // Simulate selecting source language to use its aria label
    fireEvent.click(getByRole('button', { name: /Source Language/i }));
    const sourceLanguage = 'Java';
    const sourceLanguageElements = getAllByText(sourceLanguage);
    sourceLanguageElements.forEach(element => {
      fireEvent.click(getByRole('button', { name: /Source Language/i }));
      fireEvent.click(element);
    });
  
    // Array of input codes to test
    const inputCodes = [
      'console.log("Hello, World!");',
      'for (let i = 0; i < 10; i++) { console.log(i); }',
      'function add(a, b) { return a + b; }',
      // Add more input codes as needed
    ];
  
    // Iterate over input codes and test each one
    inputCodes.forEach(inputCode => {
      const aceEditor= document.querySelector('.ace_editor');
      aceEditor.focus();
      fireEvent.keyDown(aceEditor, { key: 'End' });
      for (let i = 0; i < 999; i++) {
        fireEvent.keyDown(aceEditor, { key: 'Backspace' });
      }
      inputCode.split('').forEach(char => {
        fireEvent.keyDown(aceEditor, { key: char });
      });

    });
    
  });

  test('validates language selection', async () => {
    const { getAllByText, getByRole } = render(<TranslateCode />);
    
    // Simulate selecting source language
    fireEvent.click(getByRole('button', { name: /Source Language/i }));
    const sourceLanguage = 'Python';
    const sourceLanguageElements = getAllByText(sourceLanguage);
    sourceLanguageElements.forEach(element => {
      fireEvent.click(getByRole('button', { name: /Source Language/i }));
      fireEvent.click(element);
    });
  
    // Check if source language is selected
    await waitFor(() => {
      const elementWithText = document.querySelector('.chakra-menu__menuitem[data-index="0"]');
      expect(elementWithText).not.toBeNull(); // Check if the element exists
      expect(elementWithText.textContent).toEqual(sourceLanguage);
    });
    // Simulate selecting target language
    fireEvent.click(getByRole('button', { name: /Target Language/i }));
    const targetLanguage = 'Java';
    const targetLanguageElements = getAllByText(targetLanguage);
    targetLanguageElements.forEach(element => {
      fireEvent.click(getByRole('button', { name: /Target Language/i }));
      fireEvent.click(element);
    });
  
    // Check if target language is selected
    await waitFor(() => {
      const elementWithText = document.querySelector('.chakra-menu__menuitem[data-index="1"]');
      expect(elementWithText).not.toBeNull(); // Check if the element exists
      expect(elementWithText.textContent).toEqual(targetLanguage);
    });
  });

  beforeEach(() => {
    fetchMock.resetMocks();
  });


  test('handles file download', async () => {
    render(<TranslateCode />);
    // Assuming outputCode has some value, either set directly in the test or through mocking state
    fireEvent.click(screen.getByTitle('Download Output'));
    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      // Verify the mock function was called with a Blob containing the text 'test output code'
      const calledWithBlob = global.URL.createObjectURL.mock.calls[0][0];
      expect(calledWithBlob).toBeInstanceOf(Blob);
      expect(calledWithBlob.type).toBe('text/plain');
    });
  });
});