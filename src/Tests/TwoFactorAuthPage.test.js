import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';
import TwoFactorAuthPage from '../Pages/TwoFactorAuthPage'; 
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider, extendTheme, useToast } from '@chakra-ui/react';

fetchMock.enableMocks();

const theme = extendTheme();

beforeEach(() => {
  fetchMock.resetMocks();
  jest.clearAllMocks();
});

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: { email: 'user@example.com', remember_me: true } })
}));

const mockedToast = jest.fn();
jest.mock('@chakra-ui/react', () => {
  const originalModule = jest.requireActual('@chakra-ui/react');
  return {
    ...originalModule,
    useToast: () => jest.fn().mockImplementation(() => ({
      add: jest.fn().mockName('mockedToast'),
    })),
  };
});


jest.mock('../Components/AuthContext', () => ({
  useAuth: () => ({ login: jest.fn() }),
}));

// jest.mock('@chakra-ui/react', () => ({
//   ...jest.requireActual('@chakra-ui/react'),
//   useToast: () => () => ({ add: jest.fn() }),
// }));

const Wrapper = ({ children }) => (
    <ChakraProvider theme={theme}> 
    <BrowserRouter>
    {children}
    </BrowserRouter>
    </ChakraProvider> );

//export const renderWithWrapper = (component

describe('TwoFactorAuthPage', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    jest.clearAllMocks();
  });

  it('renders the input for the 2FA code correctly', () => {
    render(<TwoFactorAuthPage />, { wrapper: Wrapper });
    expect(screen.getByPlaceholderText(/Enter your 2FA code/i)).toBeInTheDocument();
  });

  beforeEach(() => {
    fetchMock.resetMocks();
    jest.clearAllMocks();
  });

  it('submits the 2FA code and handles success', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ user: 'user123', token: 'token456' }), { status: 200 });
    render(<TwoFactorAuthPage />, { wrapper: Wrapper });

    fireEvent.change(screen.getByPlaceholderText(/Enter your 2FA code/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /verify/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  beforeEach(() => {
    fetchMock.resetMocks();
    jest.clearAllMocks();
  });

  // it('shows an error message when an invalid 2FA code is submitted', async () => {
  //   fetchMock.mockResponseOnce(JSON.stringify({ error: 'Invalid code' }), { status: 400 });
  //   render(<TwoFactorAuthPage />, { wrapper: Wrapper });
  
  //   fireEvent.change(screen.getByPlaceholderText(/Enter your 2FA code/i), { target: { value: 'wrongcode' } });
  //   fireEvent.click(screen.getByRole('button', { name: /verify/i }));
  
  //   await waitFor(() => {
  //     expect(screen.getByText(/Invalid 2FA code/i)).toBeInTheDocument();
  //   });
  // });
  
  // beforeEach(() => {
  //   fetchMock.resetMocks();
  //   jest.clearAllMocks();
  // });

});
