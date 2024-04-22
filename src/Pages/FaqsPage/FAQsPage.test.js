import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FAQsPage, { initialFaqs } from './FAQsPage'; // Adjust the import based on your actual file structure
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

// Mocking Chakra UI hooks and components
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'), // Import then override
  useToast: jest.fn(),
  useDisclosure: () => ({
    isOpen: false,
    onOpen: jest.fn(),
    onClose: jest.fn(),
  }),
}));

// Mocking react-router-dom Link component
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children }) => <div>{children}</div>,
}));

// Mocking speech recognition
global.window.webkitSpeechRecognition = jest.fn();

describe('FAQsPage Component Tests', () => {
  test('renders without crashing', () => {
    render(<FAQsPage />, { wrapper: BrowserRouter });
    expect(screen.getByPlaceholderText('Search FAQs...')).toBeInTheDocument();
  });

  test('displays initial FAQs', () => {
    render(<FAQsPage />, { wrapper: BrowserRouter });
    initialFaqs.forEach((faq) => {
      expect(screen.getByText(faq.question)).toBeInTheDocument();
    });
  });

  test('filter FAQs based on search term', async () => {
    render(<FAQsPage />, { wrapper: BrowserRouter });
    const input = screen.getByPlaceholderText('Search FAQs...');
    fireEvent.change(input, { target: { value: 'free' } });
    await waitFor(() => {
      expect(screen.getByText('Is it free?')).toBeInTheDocument();
      expect(screen.queryByText('How does it work?')).not.toBeInTheDocument(); // Corrected from screen.ByText to screen.queryByText
    });
  });
  
  test('voice search starts and processes result correctly', () => {
    window.webkitSpeechRecognition = jest.fn().mockImplementation(() => ({
      start: jest.fn(),
      onresult: jest.fn((event) => {
        // Simulate speech recognition result
        event({ results: [[{ transcript: "free" }]] });
      }),
      onerror: jest.fn(),
      onend: jest.fn(),
    }));
  
    render(<FAQsPage />, { wrapper: BrowserRouter });
    const voiceSearchButton = screen.getByLabelText('Voice Search');
    fireEvent.click(voiceSearchButton);
  
    expect(window.webkitSpeechRecognition).toHaveBeenCalled();
  });

  test('FAQ filtering is case insensitive and handles special characters', async () => {
    render(<FAQsPage />, { wrapper: BrowserRouter });
    const input = screen.getByPlaceholderText('Search FAQs...');
  
    // Test case insensitivity
    fireEvent.change(input, { target: { value: 'free'.toUpperCase() } });
    await waitFor(() => {
      expect(screen.getByText('Is it free?')).toBeInTheDocument();
    });
  
    // Test special characters
    fireEvent.change(input, { target: { value: 'how does it work?' } });
    await waitFor(() => {
      expect(screen.getByText('How does it work?')).toBeInTheDocument();
    });
  });  
});