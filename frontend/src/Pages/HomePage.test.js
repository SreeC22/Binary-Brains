import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom'
import HomePage from './HomePage';
describe('HomePage', () => {
 
  it('renders without crashing', () => {
    render(
      <Router>
        <HomePage />
      </Router>
    );
    expect(screen.getByText(/Transform Your Code with Ease and Efficiency/i)).toBeInTheDocument();
  });

it('has a get started button', () => {
    render(
        <Router>
            <HomePage />
        </Router>
    );
    expect(screen.getByRole('button', { name: /Get Started/i })).toBeInTheDocument();
});

  it('renders correctly on different screen sizes', () => {
    global.innerWidth = 500; // Simulate a mobile screen
    global.dispatchEvent(new Event('resize'));
    render(
      <Router>
        <HomePage />
      </Router>
    );
    // Perform assertions relevant to mobile layout
  });
  it('matches snapshot', () => {
    const { asFragment } = render(
      <Router>
        <HomePage />
      </Router>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  // Add more tests for other elements...
});