import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'; // Import this to use jest-dom matchers
import CodeSubmission from './CodeSubmission'; // Assuming this is the filename of your component

describe('CodeSubmission', () => {
  test('accepts input code', () => {
    render(<CodeSubmission />);
    
    const inputTextArea = screen.getByLabelText('Input Code');
    fireEvent.change(inputTextArea, { target: { value: 'const x = 10;' } });

    expect(inputTextArea).toHaveValue('const x = 10;');
  });

  test('validates language selection', () => {
    render(<CodeSubmission />);
    
    // Click Convert without selecting any language
    fireEvent.click(screen.getByText('Convert'));

    expect(screen.getByText('Both source and target languages are required')).toBeInTheDocument();

    // Select source language
    fireEvent.click(screen.getByText('Source Language'));
    fireEvent.click(screen.getByText('Python'));

    // Click Convert without selecting target language
    fireEvent.click(screen.getByText('Convert'));

    expect(screen.getByText('Both source and target languages are required')).toBeInTheDocument();

    // Select target language
    fireEvent.click(screen.getByText('Target Language'));
    fireEvent.click(screen.getByText('Java'));

    // Click Convert with both languages selected
    fireEvent.click(screen.getByText('Convert'));

    expect(screen.queryByText('Both source and target languages are required')).not.toBeInTheDocument();
  });
});
