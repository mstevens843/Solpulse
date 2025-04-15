/**
 * TokenModal.js
 *
 * This file is responsible for rendering a modal that allows users to select a Solana-based token.
 * It enables users to:
 * - View a list of tokens from their wallet.
 * - Search for tokens by name or address.
 * - Select a token for a transaction.
 *
 * Features:
 * - **Live Search Functionality**: Searches for tokens dynamically as the user types.
 * - **Token Selection**: Allows users to select a token and pass it to the parent component.
 * - **Image Handling**: Fetches token logos from Trust Wallet API and hides broken images.
 * - **Optimized Performance**: Uses caching (`searchedTokens`) to avoid redundant API calls.
 */

import React, { useState, useEffect } from "react";
import { fetchTokenInfo } from "@/utils/tokenApi";
import "@/css/components/Crypto_components/TokenModal.css";

const TokenModal = ({ isOpen, onClose, tokens, handleCoinSelect, type }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortedTokens, setSortedTokens] = useState([]);
    const [searchedTokens, setSearchedTokens] = useState({});
    const [selectedMint, setSelectedMint] = useState(null); 
    const [loading, setLoading] = useState(false); 
    const [error, setError] = useState(""); 

    useEffect(() => {
        if (!tokens) return;
        setSortedTokens(tokens);
    }, [tokens]);

    if (!isOpen) return null;

    const formatMintAddress = (mint) => `${mint.slice(0, 4)}...${mint.slice(-4)}`;

    const handleSearch = async (term) => {
        setSearchTerm(term);
        setError("");
        setLoading(true); // Start loading

        if (!term) {
            setSortedTokens(tokens);
            setLoading(false); //  End loading
            return;
        }

        if (searchedTokens[term]) {
            setSortedTokens([searchedTokens[term]]);
            setLoading(false); // End loading
            return;
        }

        try {
            const tokenData = await fetchTokenInfo(term);

            if (tokenData) {
                const newToken = {
                    mint: tokenData.address || term,
                    name: tokenData.name || tokenData.symbol || `Token (${formatMintAddress(term)})`,
                    symbol: tokenData.symbol || term.slice(0, 6),
                    logoURI: tokenData.logoURI || null,
                    amount: 0,
                    price: tokenData.price || null, // Expanded token data
                    change24h: tokenData.change24h || null, // Price change
                };

                setSearchedTokens((prev) => ({ ...prev, [term]: newToken }));
                setSortedTokens([newToken]);
            } else {
                setSortedTokens([]);
                setError("❌ Token not found.");
            }
        } catch (err) {
            console.error("❌ Token search failed:", err);
            setSortedTokens([]);
            setError("❌ Failed to fetch token info.");
        } finally {
            setLoading(false); // End loading
        }
    };

    return (
        <div className="token-modal-overlay" onClick={onClose}>
            <div className="token-modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Select a Token</h2>

                <input
                    type="text"
                    placeholder="Search by token or paste address..."
                    className="token-search"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                />

                {loading && <p className="token-loading">Searching...</p>} {/* Loading message */}
                {error && <p className="token-error">{error}</p>} {/* Error display */}

                <ul className="token-list">
                    {sortedTokens.length === 0 && !loading && !error ? (
                        <p className="no-tokens">No tokens found.</p>
                    ) : (
                        sortedTokens.map((token) => (
                            <li
                                key={token.mint}
                                className={`token-item ${selectedMint === token.mint ? "selected-token" : ""}`} // Highlight selected
                                onClick={() => {
                                    handleCoinSelect(token, type);
                                    setSelectedMint(token.mint);
                                    onClose();
                                }}
                            >
                                <img
                                    src={
                                        token.logoURI ||
                                        `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/${token.mint}/logo.png`
                                    }
                                    alt={token.symbol}
                                    className="token-logo"
                                    onError={(e) => (e.target.style.display = "none")}
                                />
                                <div className="token-info">
                                    <span className="token-symbol">{token.symbol}</span>
                                    {token.price && (
                                        <span className="token-price">
                                            ${token.price.toFixed(4)}{" "}
                                            {token.change24h !== null && (
                                                <span className={`change ${token.change24h >= 0 ? "up" : "down"}`}>
                                                    ({token.change24h.toFixed(2)}%)
                                                </span>
                                            )}
                                        </span>
                                    )}
                                </div>
                                {token.amount > 0 && (
                                    <span className="token-amount">{parseFloat(token.amount).toFixed(2)}</span>
                                )}
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
};

export default TokenModal;