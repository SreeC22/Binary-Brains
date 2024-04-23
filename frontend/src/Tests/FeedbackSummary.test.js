import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import FeedbackSummary from '../Pages/FeedbackPage/FeedbackSummary';
import '@testing-library/jest-dom';

// Mock fetch before importing your component if your component executes fetch on load.
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({
      aggregatedData: {
        averageRating: 5.0,
        totalFeedback: 10,
      },
      feedbackEntries: [
        { rating: 5, message: "Excellent service!" },
        { rating: 5, message: "Excellent service!" },
        { rating: 5, message: "Excellent service!" },
        { rating: 5, message: "Excellent service!" },
        { rating: 5, message: "Excellent service!" },
        { rating: 5, message: "Excellent service!" },
        { rating: 5, message: "Excellent service!" },
        { rating: 5, message: "Excellent service!" },
        { rating: 5, message: "Excellent service!" },
        { rating: 5, message: "Excellent service!" },
      ]
    }),
  })
);

beforeEach(() => {
  fetch.mockClear();
});

describe('FeedbackSummary', () => {

    it('renders loading indicator before data is fetched', () => {
        render(<FeedbackSummary />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders feedback summary and chart correctly', async () => {
        render(<FeedbackSummary />);
        // Add more expectations to test your component
        await waitFor(() => {
            expect(screen.getByText('Average Rating')).toBeInTheDocument();
            expect(screen.getByText('Total Feedback')).toBeInTheDocument();
        });
    });


});
