import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter as Router } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import NavBar from './NavBar'; // Adjust the import path to your NavBar component

// Mock useNavigate from react-router-dom
const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigate,
}));

// Optional: Mock the useAuth hook if your NavBar component uses it
jest.mock('./AuthContext', () => ({
    useAuth: () => ({
        user: null, // or whatever default state you want for your tests
        logout: jest.fn(),
    }),
}));

describe('NavBar Component', () => {
    // Function to render NavBar with all necessary providers
    const setup = () =>
        render(
            <Router>
                <ChakraProvider>
                    <NavBar />
                </ChakraProvider>
            </Router>
        );

    test('renders the navigation links correctly', () => {
        setup();
        expect(screen.getByText('Translate Code')).toBeInTheDocument();
        expect(screen.getByText('Code Conversion')).toBeInTheDocument();
        expect(screen.getByText('Feedback')).toBeInTheDocument();

        // Ensure dropdown menu items are present
        expect(screen.getByText('Documentation')).toBeInTheDocument();
        expect(screen.getByText('Tutorial')).toBeInTheDocument();
        expect(screen.getByText("FAQ's")).toBeInTheDocument();
        expect(screen.getByText('Contact Us')).toBeInTheDocument();
    });

    test('color mode toggle button is present and clickable', () => {
        setup();

        const colorModeButton = screen.getByRole('button', {
            name: /Switch to dark mode/i,
        });
        expect(colorModeButton).toBeInTheDocument();
        fireEvent.click(colorModeButton);
    });
});
