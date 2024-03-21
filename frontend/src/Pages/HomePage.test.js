// HomePage.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from './HomePage';
import { BrowserRouter as Router } from 'react-router-dom';

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
    expect(screen.getByText(/Transform Your Code with Ease and Efficiency/i)).toBeInTheDocument();
    expect(screen.getByText(/Get Started with Our Code Translation Tool/i)).toBeInTheDocument();
    expect(screen.getByText(/Experience seamless code translation with our user-friendly interface./i)).toBeInTheDocument();
  });


  test('renders responsive elements for different screen sizes', () => {
    global.innerWidth = 500; // Simulate small screen
    setup();

    expect(screen.getByText(/Transform Your Code/i)).toBeInTheDocument();

    global.innerWidth = 1024; 
  });

});
