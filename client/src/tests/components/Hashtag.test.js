import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Hashtag from '../../Archive/Hashtag';

describe('Hashtag Component', () => {
    const renderWithRouter = (component) => {
        return render(<BrowserRouter>{component}</BrowserRouter>);
    };

    afterEach(() => {
        jest.clearAllMocks(); // Reset mocks after each test
    });

    it('renders the hashtag link with the correct tag', () => {
        const testTag = 'Solana';

        renderWithRouter(<Hashtag tag={testTag} />);

        const hashtagLink = screen.getByRole('link', { name: `View posts tagged with ${testTag}` });
        expect(hashtagLink).toBeInTheDocument();
        expect(hashtagLink).toHaveTextContent(`#${testTag}`);
        expect(hashtagLink).toHaveAttribute('href', `/hashtag/${encodeURIComponent(testTag)}`);
        expect(hashtagLink).toHaveClass('hashtag'); // Ensure the class is applied
    });

    it('does not render if the tag is invalid or too long', () => {
        const invalidTags = [null, undefined, 123, 'a'.repeat(51), '  Solana  ']; // Invalid tag cases
        
        invalidTags.forEach((tag) => {
            const { container } = renderWithRouter(<Hashtag tag={tag} />);
            expect(container.firstChild).toBeNull(); // Expect the component not to render
        });
    });
    
    
    

    it('logs an error to the console for invalid or too long tags', () => {
        const invalidTag = 'a'.repeat(51);
        console.error = jest.fn();

        renderWithRouter(<Hashtag tag={invalidTag} />);

        expect(console.error).toHaveBeenCalledWith(
            'Invalid or too long tag provided to Hashtag component:',
            invalidTag
        );
    });

    it('encodes special characters in the tag for the URL', () => {
        const specialCharTag = 'crypto&blockchain';

        renderWithRouter(<Hashtag tag={specialCharTag} />);

        const hashtagLink = screen.getByRole('link', {
            name: `View posts tagged with ${specialCharTag}`,
        });
        expect(hashtagLink).toHaveAttribute(
            'href',
            `/hashtag/${encodeURIComponent(specialCharTag)}`
        );
    });
});