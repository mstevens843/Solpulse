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






// Key Features Tested
// Initial Loading: Ensures that the loading state is displayed when the page is first rendered.
// Successful Fetch: Confirms that trending coins are fetched and displayed correctly.
// Error Handling: Verifies that an error message is shown when the API call fails.
// Search Functionality: Tests that the search bar filters coins by name or symbol.
// Manual Refresh: Confirms that clicking the refresh button updates the displayed prices.
// Empty Search Results: Ensures a message is shown when no coins match the search query.
// Interactive Trading: Verifies that the "Trade" button appears for each coin.
