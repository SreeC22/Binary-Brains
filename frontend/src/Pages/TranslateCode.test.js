import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import CodeSubmission from './CodeSubmission'; // Update the path as per your project structure
describe('CodeSubmission', () => {
  test('renders without crashing', () => {
    render(<CodeSubmission />);
  });

  test('accepts input code', async () => {
    const { getByRole, getAllByText} = render(<CodeSubmission />);
    
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
    const { getAllByText, getByRole } = render(<CodeSubmission />);
    
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
      const elementWithText = document.querySelector('.chakra-text.css-6dvxm2');
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
});
