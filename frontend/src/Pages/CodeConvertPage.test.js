import { render, screen, fireEvent } from '@testing-library/react';
import CodeTranslationForm from './CodeTranslationForm';

describe('CodeTranslationForm', () => {
  test('renders source language dropdown', () => {
    render(<CodeTranslationForm />);
    const sourceLanguageDropdown = screen.getByLabelText('Source Language');
    expect(sourceLanguageDropdown).toBeInTheDocument();
  });

  test('renders target language dropdown', () => {
    render(<CodeTranslationForm />);
    const targetLanguageDropdown = screen.getByLabelText('Target Language');
    expect(targetLanguageDropdown).toBeInTheDocument();
  });

  test('renders input code editor', () => {
    render(<CodeTranslationForm />);
    const inputCodeEditor = screen.getByLabelText('Input Code');
    expect(inputCodeEditor).toBeInTheDocument();
  });

  test('renders output code editor', () => {
    render(<CodeTranslationForm />);
    const outputCodeEditor = screen.getByLabelText('Output Code');
    expect(outputCodeEditor).toBeInTheDocument();
  });

  test('renders convert button', () => {
    render(<CodeTranslationForm />);
    const convertButton = screen.getByRole('button', { name: 'Convert' });
    expect(convertButton).toBeInTheDocument();
  });

  test('renders "How to use this tool?" text', () => {
    render(<CodeTranslationForm />);
    const howToUseText = screen.getByText(/How to use this tool?/i);
    expect(howToUseText).toBeInTheDocument();
  });

  test('renders available languages list', () => {
    render(<CodeTranslationForm />);
    const availableLanguagesList = screen.getByText(/Available Languages:/i);
    expect(availableLanguagesList).toBeInTheDocument();
  });

  test('clicking convert button triggers conversion process', () => {
    render(<CodeTranslationForm />);
    const convertButton = screen.getByRole('button', { name: 'Convert' });
    fireEvent.click(convertButton);
    // Add more assertions or mock API calls as needed to validate conversion process
  });
});
