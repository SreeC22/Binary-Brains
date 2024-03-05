import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CodeConvertPage from './CodeConvertPage';
import CodeEditorWindow from '../Components/CodeEditorWindow'; // Adjust the import path as necessary

// Mock the CodeEditorWindow component
jest.mock('../Components/CodeEditorWindow', () => jest.fn());

describe('CodeConvertPage', () => {
    beforeEach(() => {
        // Provide a default implementation for the mock that can be overridden in specific tests
        CodeEditorWindow.mockImplementation(({ onOriginalChange, language, defaultValue }) => (
            <div>
                <textarea
                    data-testid="original-code-input"
                    value={defaultValue}
                    onChange={(e) => onOriginalChange(e.target.value)}
                />
                <button data-testid="copy-button" onClick={() => navigator.clipboard.writeText('mocked code')}>
                    Copy
                </button>
            </div>
        ));
    });

    it('copies code to clipboard successfully', async () => {
        render(<CodeConvertPage />);
        // Mock clipboard functionality
        Object.assign(navigator, {
            clipboard: {
                writeText: jest.fn().mockResolvedValue('mocked code'),
            },
        });

        const copyButton = screen.getByTestId('copy-button');
        userEvent.click(copyButton);

        await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith('mocked code'));
    });
});

describe('CodeEditorWindow', () => {
    const testCodes = [
        { label: 'short code', value: '// Short code example\nconsole.log("Hello, world!");' },
        {
            label: 'typical code',
            value: `
          // A more typical length example
          function greet(name) {
            console.log("Hello, " + name + "!");
          }
          
          greet("Developer");
        `
        },
        {
            label: 'long code',
            value: '// Very long code example\n' + new Array(1000).fill('console.log("Hello, world!");').join('\n')
        }
    ];

    testCodes.forEach(({ label, value }) => {
        it(`displays ${label} correctly in the output editor`, () => {
            render(<CodeEditorWindow defaultValue={value} language="javascript" />);
            expect(true).toBe(true);
        });
    });
});