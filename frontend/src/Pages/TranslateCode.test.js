import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TranslateCode from './TranslateCode'; // Import your component

describe('TranslateCode', () => {
    const mockTranslationHistory = [
        { sourceLanguage: 'Python', targetLanguage: 'Java', inputCode: 'print("Hello, World!")', outputCode: 'System.out.println("Hello, World!");' },
        // Add more mock history records as needed for the test
    ];

    it('displays translation history correctly', () => {
        render(<TranslateCode />);

        // Mock setting the translation history
        // You would need a way to set this within your component, or refactor your component to accept initial state
        const { getByText, getByRole } = screen;
        const historyButton = getByRole('button', { name: /translate history/i });
        userEvent.click(historyButton);

        // Check that all history records are displayed
        mockTranslationHistory.forEach((history) => {
            expect(getByText(new RegExp(history.sourceLanguage))).toBeInTheDocument();
            expect(getByText(new RegExp(history.targetLanguage))).toBeInTheDocument();
            // Check for truncated texts if you implemented truncation for long code
            expect(getByText(new RegExp(history.inputCode.slice(0, 50)))).toBeInTheDocument();
            expect(getByText(new RegExp(history.outputCode.slice(0, 50)))).toBeInTheDocument();
        });
    });

    it('handles scrolling when many records are present', () => {
        render(<TranslateCode />);

        // Assuming you have a function to simulate or directly set the translation history state
        // You would call it here with a large number of records to simulate a scrollable list
        // For this test to be meaningful, your component should have a set maxHeight for the MenuList and overflowY set to auto

        // Check if the MenuList container is scrollable
        const historyMenuList = screen.getByRole('menu'); // You might need to adjust this to target the correct element
        expect(historyMenuList).toHaveStyle(`maxHeight: 300px; overflowY: auto;`);

        // Alternatively, you can check for scrollHeight > clientHeight
        expect(historyMenuList.scrollHeight).toBeGreaterThan(historyMenuList.clientHeight);
    });
});
