mport React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import LoginPage from '../components/LoginPage';

const server = setupServer(
  rest.post(`${process.env.REACT_APP_BACKEND_URL}/register`, (req, res, ctx) => {
    return res(ctx.json({ message: "Registration successful" }));
  }),
  rest.post(`${process.env.REACT_APP_BACKEND_URL}/login`, (req, res, ctx) => {
    return res(ctx.json({ message: "Login successful" }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('validates email format', async () => {
  render(<LoginPage />);
  const input = screen.getByLabelText(/email/i);
  await userEvent.type(input, 'invalid-email');
  const errorMessage = screen.getByText(/email is invalid/i);
  expect(errorMessage).toBeInTheDocument();
});

test('validates password strength', async () => {
  render(<LoginPage />);
  const input = screen.getByLabelText(/password/i);
  await userEvent.type(input, 'short');
  const errorMessage = screen.getByText(/password must be at least 8 characters/i);
  expect(errorMessage).toBeInTheDocument();
});

test('checks password confirmation matches password', async () => {
  render(<LoginPage />);
  const passwordInput = screen.getByLabelText(/password/i);
  const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
  await userEvent.type(passwordInput, 'password123');
  await userEvent.type(confirmPasswordInput, 'password1234');
  const errorMessage = screen.getByText(/passwords do not match/i);
  expect(errorMessage).toBeInTheDocument();
});