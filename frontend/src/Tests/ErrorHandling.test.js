import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TranslateCode from '../Pages/TranslateCode';
import { enableFetchMocks } from 'jest-fetch-mock';
import { act } from 'react-dom/test-utils'; // Import act from react-dom/test-utils

jest.useFakeTimers();

enableFetchMocks();
jest.mock('node-fetch'); // Mock the fetch module

describe('TranslateCode Component', () => {
  const clipboardWriteTextMock = jest.fn(() => Promise.reject(new Error('Clipboard copy error')));

  beforeEach(() => {
    // Replace navigator.clipboard.writeText with the mock function
    global.navigator.clipboard = {
      writeText: clipboardWriteTextMock
    };
  });

  afterEach(() => {
    // Restore the original implementation after each test
    delete global.navigator.clipboard;
  });
  test('handles API failure error', async () => {
    fetch.mockRejectOnce(() => Promise.reject(new Error('Internal Server Error')));

    const { getByText } = render(<TranslateCode />);

    await waitFor(() => expect(getByText(/API Error/)).toBeInTheDocument());
    expect(getByText(/Please check your internet connection or try again later./)).toBeInTheDocument();
  });

  test('handles rate limit exceeded error', async () => {
    // Render the component
    const { getByLabelText, queryByText } = render(<TranslateCode />);
  
    // Mock the API response to simulate rate limit exceeded error
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      status: 429, // Simulate rate limit exceeded error
      json: async () => ({ error: { message: 'Rate Limit Exceeded' } })
    });
  
    // Trigger the action that would result in rate limit exceeded error
    fireEvent.click(getByLabelText(/Convert/));
  
    // Wait for the error message to appear
    await waitFor(() => {
      expect(queryByText(/Rate Limit Exceeded/)).toBeInTheDocument();
    });
  });

  test('handles timeout error', async () => {
    // Render the component
    const { getByLabelText, queryByText } = render(<TranslateCode />);
  
    // Mock the API response to simulate a long-running translation
    jest.spyOn(global, 'fetch').mockImplementationOnce(() => new Promise(() => {}));
  
    // Trigger the action that would result in a timeout error
    act(() => {
      fireEvent.click(getByLabelText(/Convert/));
    });
  
    // Fast-forward time by 10 minutes (600000 milliseconds)
    jest.advanceTimersByTime(600000);
  
    // Check if the error message appears
    await waitFor(() => {
      expect(queryByText(/Translation Timeout/)).toBeInTheDocument();
    });
  });
  
  
  
  

  

  test('handles clipboard copy input error', async () => {
    const { getByTitle, getByText } = render(<TranslateCode />);

    fireEvent.click(getByTitle(/CopyInput/));

    await waitFor(() => expect(getByText(/An error occurred while copying input code: Clipboard copy error/)).toBeInTheDocument());
  });
  
});
