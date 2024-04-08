// HomePage.test.js
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import HomePage from './HomePage';

// Mock useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('HomePage Component', () => {
  // Render the component inside a Router since it uses useNavigate and Link
  const setup = () => render(
    <Router>
      <HomePage />
    </Router>
  );

  test('renders HomePage component with all sections', () => {
    setup();

    // Test for presence of main sections based on their class names or text content
    expect(screen.getByText(/Transform Your Code with Ease and Efficiency/i)).toBeInTheDocument();
    expect(screen.getByText(/Get Started with Our Code Translation Tool/i)).toBeInTheDocument();
    expect(screen.getByText(/Experience seamless code translation with our user-friendly interface./i)).toBeInTheDocument();
    //expect(screen.getByText(/FAQs/i)).toBeInTheDocument();
  });


  test('renders responsive elements for different screen sizes', () => {
    // Example of responsiveness test, focusing on conditional rendering or layout changes
    global.innerWidth = 500; // Simulate small screen
    setup();

    // Test for elements specific to small screens
    // This could include checking for the presence of a hamburger menu, or other responsive design elements.
    expect(screen.getByText(/Transform Your Code/i)).toBeInTheDocument();

    // Clean up after altering global values
    global.innerWidth = 1024; // Reset to default for other tests
  });

  // Add more tests as needed for other interactive elements, such as accordions, modals, etc.
});