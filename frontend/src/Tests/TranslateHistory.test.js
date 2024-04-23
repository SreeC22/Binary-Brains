// TranslateHistory.test.js
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';
import TranslateHistory from '../Pages/TranslateHistory';
import { AuthProvider } from '../Components/AuthContext';
import { BrowserRouter } from 'react-router-dom';

fetchMock.enableMocks();

beforeEach(() => {
  fetchMock.resetMocks();
});

const mockTranslationData = [
  {
    _id: '507f1f77bcf86cd799439011',
    email: 'sree@test.com',
    source_code: "def is_prime(n):\r\n    if n <= 1:\r\n        return False\r\n    # logic omitted for brevity\r\n",
    translated_code: "\nfunction isPrime(n) {\r\n  if (n <= 1) {\r\n    return false;\r\n  }\r\n  // logic omitted for brevity\r\n}",
    source_language: 'python',
    target_language: 'cpp',
    created_at: '2024-04-19T19:23:53Z',
  },
  {
    _id: '507f1f77bcf86cd799439012',
    email: 'sree@test.com',
    source_code: "def is_prime(n):\r\n    if n <= 1:\r\n        return False\r\n    # logic omitted for brevity\r\n",
    translated_code: "\n#include <iostream>\n#include <vector>\nint main() {\n  // logic omitted for brevity\n  return 0;\n}",
    source_language: 'python',
    target_language: 'typescript',
    created_at: '2024-04-19T19:23:54Z',
  },
  // More translations can be added if needed
];

describe('TranslateHistory Component', () => {
  it('displays loading state correctly', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockTranslationData));

    render(
      <BrowserRouter>
        <AuthProvider>
          <TranslateHistory />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument());
  });

  it('deletes individual translation entry correctly', async () => {
    fetchMock.mockResponses(
      [JSON.stringify(mockTranslationData), { status: 200 }],
      [JSON.stringify({}), { status: 200 }]
    );

    render(
      <BrowserRouter>
        <AuthProvider>
          <TranslateHistory />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByText(new RegExp(mockTranslationData[0].source_code))).toBeInTheDocument());
    const deleteButtons = screen.getAllByLabelText(/delete translation history entry/i);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => expect(screen.queryByText(new RegExp(mockTranslationData[0].source_code))).not.toBeInTheDocument());
  });

  it('clears entire translation history correctly', async () => {
    fetchMock.mockResponses(
      [JSON.stringify(mockTranslationData), { status: 200 }],
      [JSON.stringify({}), { status: 200 }]
    );

    render(
      <BrowserRouter>
        <AuthProvider>
          <TranslateHistory />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByText(new RegExp(mockTranslationData[0].source_code))).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Clear/i));

    await waitFor(() => expect(screen.queryByText(new RegExp(mockTranslationData[0].source_code))).not.toBeInTheDocument());
  });

  it('displays an error message on fetch failure', async () => {
    fetchMock.mockReject(new Error('API failure'));

    render(
      <BrowserRouter>
        <AuthProvider>
          <TranslateHistory />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByText(/Failed to load translation history/i)).toBeInTheDocument());
  });
});

