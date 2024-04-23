import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FAQsPage from './FAQsPage';

// Mocking the necessary modules and methods
jest.mock('react-router-dom', () => ({
  Link: ({ children, to }) => <div data-testid="mock-link">{children}</div>
}));

global.window.webkitSpeechRecognition = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  onresult: jest.fn(),
  onerror: jest.fn(),
  onend: jest.fn(),
}));

describe('FAQsPage Component', () => {
  beforeEach(() => {
    render(<FAQsPage />);
  });
  
  test('initial state has correct FAQs and resources', () => {
    expect(screen.getByText('How does it work?')).toBeInTheDocument();
    expect(screen.getByText('Tutorial 1')).toBeInTheDocument();
  });

  test('search functionality filters FAQs', async () => {
    fireEvent.change(screen.getByPlaceholderText('Search FAQs...'), { target: { value: 'free' } });
    await waitFor(() => {
      expect(screen.getByText('Is it free?')).toBeInTheDocument();
      expect(screen.queryByText('How does it work?')).toBeNull();
    });
  });

  test('no results when search does not match any FAQs', () => {
    fireEvent.change(screen.getByPlaceholderText('Search FAQs...'), { target: { value: 'nonexistent' } });
    expect(screen.queryByText('How does it work?')).toBeNull();
  });

  test('voice search button starts listening', () => {
    fireEvent.click(screen.getByLabelText('Voice Search'));
    expect(window.webkitSpeechRecognition).toHaveBeenCalledTimes(1);
  });

  test('handles speech recognition errors', () => {
    const recognition = new window.webkitSpeechRecognition();
    fireEvent.click(screen.getByLabelText('Voice Search'));
    recognition.onerror({ error: 'not-allowed' });
    expect(screen.queryByDisplayValue('secure')).toBeNull();
  });

  test('opens modal with content when FAQ item is clicked', () => {
    fireEvent.click(screen.getByText('How does it work?'));
    expect(screen.getByText('Here is how it works: Write your code...')).toBeInTheDocument();
  });

  test('resource links and downloads are functional', () => {
    const learnMoreButton = screen.getAllByText('Learn More')[0];
    const downloadButton = screen.getByText('Download');

    expect(learnMoreButton).toBeInTheDocument();
    expect(downloadButton).toBeInTheDocument();
    expect(downloadButton).toHaveAttribute('href', 'meme.png');
  });
});
