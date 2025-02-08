// src/tests/pages/TrendingCryptoPage.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import TrendingCryptoPage from '../../pages/TrendingCrypto';

// Mock the TrendingCrypto component
jest.mock('../../components/TrendingCrypto', () => () => <div>Mock TrendingCrypto Component</div>);

describe('TrendingCryptoPage', () => {
    it('renders the page header and TrendingCrypto component', () => {
        // Render the page
        render(<TrendingCryptoPage />);

        // Assert the header text is displayed
        expect(screen.getByRole('heading', { name: /explore trending coins/i })).toBeInTheDocument();

        // Assert the mocked TrendingCrypto component is rendered
        expect(screen.getByText(/mock trendingcrypto component/i)).toBeInTheDocument();
    });
});
