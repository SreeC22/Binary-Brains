import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import CodeSubmission from './CodeSubmission';


describe('CodeSubmission component', () => {
  it('renders correctly', () => {
    const { getByText } = render(<CodeSubmission />);
    expect(getByText('Submit Your Code')).toBeInTheDocument();
  });

  it('updates input code state correctly', () => {
    const { getByLabelText } = render(<CodeSubmission />);
    const inputCodeInput = getByLabelText('Input Code');
    fireEvent.change(inputCodeInput, { target: { value: 'Test input code' } });
    expect(inputCodeInput.value).toBe('Test input code');
  });

});

describe('Additional tests', () => {
  it('displays error message when source language is not selected', async () => {
    const { getByText } = render(<CodeSubmission />);
    const convertButton = getByText('Convert');
    fireEvent.click(convertButton);
    await waitFor(() => {
      expect(getByText('Source language is required')).toBeInTheDocument();
    });
  });

  it('updates output code state after conversion', async () => {
    const { getByText, getByTestId } = render(<CodeSubmission />);
    const convertButton = getByText('Convert');
    fireEvent.click(convertButton);
    await waitFor(() => {
      expect(getByTestId('output-code')).toHaveTextContent('Generated code in [target language] will go here');
    });
  });

  it('renders components with correct styles', async () => {
    const { getByText } = render(<CodeSubmission />);
    const convertButton = getByText('Convert');
    expect(convertButton).toHaveStyle('background-color: black');
    expect(convertButton).toHaveStyle('color: white');

  });

  it('passes accessibility tests', async () => {
    const { container } = render(<CodeSubmission />);
    expect(container).toBeAccessible();
  });

});