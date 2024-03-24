import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import FAQsPage from './FAQsPage';
import { initialFaqs, initialResources } from './FAQsPage';
describe('FAQsPage', () => {
    test('renders all FAQs initially', () => {
        render(<FAQsPage />);
        initialFaqs.forEach(faq => {
            expect(screen.getByText(faq.question)).toBeInTheDocument();
        });
    });

    test('search filters FAQs correctly', () => {
        render(<FAQsPage />);
        const searchInput = screen.getByPlaceholderText('Search FAQs...');
        fireEvent.change(searchInput, { target: { value: 'free' } });
        expect(screen.getByText('Is it free?')).toBeInTheDocument();
        expect(screen.queryByText('How does it work?')).not.toBeInTheDocument();
    });

    test('renders all resource links', () => {
        render(<FAQsPage />);
        initialResources.forEach(resource => {
            const resourceTitle = screen.getByText(resource.title);
            expect(resourceTitle).toBeInTheDocument();
        });
    });

    test('renders all resource download buttons with the correct href', () => {
        render(<FAQsPage />);
        const downloadLinks = screen.getAllByText('Download').map(link => link.closest('a'));
        downloadLinks.forEach((link, index) => {
            // Ensure that only resources with a downloadLink defined are checked
            if (initialResources[index].downloadLink) {
                expect(link).toHaveAttribute('href', initialResources[index].downloadLink);
            } else {
                expect(link).not.toHaveAttribute('href'); // For resources without downloadLink, expect no href attribute
            }
        });
    });


    test('learn more buttons open modal with correct content', async () => {
        render(<FAQsPage />);
        const learnMoreButtons = screen.getAllByText('Learn More');
        fireEvent.click(learnMoreButtons[0]); // Clicks the first 'Learn More' button
        const modalContent = screen.getByText(initialResources[0].content);
        await waitFor(() => expect(modalContent).toBeInTheDocument());
    });

    test('modal closes when close button is clicked', async () => {
        render(<FAQsPage />);
        const learnMoreButtons = screen.getAllByText('Learn More');
        fireEvent.click(learnMoreButtons[0]); // Open the modal
        fireEvent.click(screen.getByTestId('modal-close-button'));
        await waitFor(() => expect(screen.queryByText(initialResources[0].content)).not.toBeInTheDocument());
    });

});
