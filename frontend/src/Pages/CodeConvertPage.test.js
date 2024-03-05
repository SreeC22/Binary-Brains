import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CodeEditorWindow from '../Components/CodeEditorWindow'; // Make sure this path matches your file structure

describe('CodeEditorWindow', () => {
  test('renders input and output code labels', () => {
    render(<CodeEditorWindow />);
    const inputCodeLabel = screen.getByText('Input Code'); // Checks for the input code label
    const outputCodeLabel = screen.getByText('Converted Code'); // Checks for the output code label
    expect(inputCodeLabel).toBeInTheDocument();
    expect(outputCodeLabel).toBeInTheDocument();
  });

  test('renders both code editors', () => {
    render(<CodeEditorWindow />);

    const editors = screen.getAllByText(/Code/); // This is a broad selector and might need adjustment
    expect(editors).toHaveLength(2); // Adjust based on how many times "Code" appears in relation to the editors
  });

  // Further detailed tests might require either a different testing strategy or mocking parts of the Monaco Editor
});
