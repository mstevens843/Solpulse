import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { WalletProvider } from '@solana/wallet-adapter-react'; // Import WalletProvider
import NavBar from '../../components/NavBar';

// Create a mock wallet config for testing purposes
const walletConfig = {
    wallets: [], // Use an empty array or mock wallet if needed
    autoConnect: false,
};

describe('NavBar Component', () => {
    it('renders the main navigation links correctly when not authenticated', () => {
        render(
            <MemoryRouter>
                <WalletProvider wallets={walletConfig.wallets} autoConnect={walletConfig.autoConnect}>
                    <NavBar isAuthenticated={false} />
                </WalletProvider>
            </MemoryRouter>
        );

        expect(screen.getByLabelText(/go to home/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/go to dashboard/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/go to login/i)).toBeInTheDocument();
    });

    it('renders the logout link when the user is authenticated', () => {
        render(
            <MemoryRouter>
                <WalletProvider wallets={walletConfig.wallets} autoConnect={walletConfig.autoConnect}>
                    <NavBar isAuthenticated={true} />
                </WalletProvider>
            </MemoryRouter>
        );

        expect(screen.getByLabelText(/logout/i)).toBeInTheDocument();
        expect(screen.queryByLabelText(/go to login/i)).not.toBeInTheDocument();
    });

    it('applies the active-link class to the active route', async () => {
        render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <WalletProvider wallets={walletConfig.wallets} autoConnect={walletConfig.autoConnect}>
                    <NavBar isAuthenticated={false} />
                </WalletProvider>
            </MemoryRouter>
        );

        const dashboardLink = screen.getByLabelText(/go to dashboard/i);
        expect(dashboardLink).toHaveClass('active-link');

        const homeLink = screen.getByLabelText(/go to home/i);
        expect(homeLink).not.toHaveClass('active-link');
    });

    it('renders the WalletMultiButton', () => {
        render(
            <MemoryRouter>
                <WalletProvider wallets={walletConfig.wallets} autoConnect={walletConfig.autoConnect}>
                    <NavBar isAuthenticated={false} />
                </WalletProvider>
            </MemoryRouter>
        );

        // Ensure that the WalletMultiButton is rendered
        expect(screen.getByRole('button', { name: /select wallet/i })).toBeInTheDocument();
    });

    it('navigates correctly when links are clicked', async () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <WalletProvider wallets={walletConfig.wallets} autoConnect={walletConfig.autoConnect}>
                    <NavBar isAuthenticated={false} />
                </WalletProvider>
            </MemoryRouter>
        );

        const dashboardLink = screen.getByLabelText(/go to dashboard/i);
        await userEvent.click(dashboardLink);

        // Ensure the navigation occurs and active-link is applied
        expect(dashboardLink).toHaveClass('active-link');
    });
});




// Key Features of the Test File
// Navigation Rendering:

// Ensures all navigation links (Home, Dashboard, Login/Logout) are rendered correctly.
// Conditional Rendering:

// Verifies the Login link appears when the user is unauthenticated and Logout appears when authenticated.
// Active Link Highlight:

// Checks the active-link class is applied correctly to the active route.
// Wallet Button:

// Ensures the WalletMultiButton renders properly in the navigation bar.
// Link Navigation:

// Simulates link clicks and validates class updates for active routes.