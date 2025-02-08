import React, { useState, useEffect } from "react";
import { fetchTokenInfo } from "@/utils/tokenApi";
import "@/css/components/Crypto_components/TokenModal.css";

const TokenModal = ({ isOpen, onClose, tokens, handleCoinSelect, type }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortedTokens, setSortedTokens] = useState([]); // Tokens to display
    const [searchedTokens, setSearchedTokens] = useState({}); // Cache searched tokens

    useEffect(() => {
        if (!tokens) return;
        console.log("✅ Tokens received in modal:", tokens);
        
        // Only display wallet tokens when modal opens
        setSortedTokens(tokens);
    }, [tokens]);

    if (!isOpen) return null; // ✅ Only render when modal is open

    const formatMintAddress = (mint) => {
        return `${mint.slice(0, 4)}...${mint.slice(-4)}`;
    };

    const handleSearch = async (searchTerm) => {
        setSearchTerm(searchTerm);

        if (!searchTerm) {
            setSortedTokens(tokens); // Reset to wallet tokens if search is empty
            return;
        }

        console.log("🔍 Searching for token:", searchTerm);

        if (searchedTokens[searchTerm]) {
            setSortedTokens([searchedTokens[searchTerm]]);
            return;
        }

        const tokenData = await fetchTokenInfo(searchTerm);
        if (tokenData) {
            const newToken = {
                mint: tokenData.address || searchTerm,
                name: tokenData.name || tokenData.symbol || `Token (${formatMintAddress(searchTerm)})`,  // FIX: Proper fallback order
                symbol: tokenData.symbol || searchTerm.slice(0, 6),
                logoURI: tokenData.logoURI || null,
                amount: 0, // No balance since it's a search
            };

            setSearchedTokens((prev) => ({ ...prev, [searchTerm]: newToken }));
            setSortedTokens([newToken]);
        } else {
            setSortedTokens([]);
        }
    };

    return (
        <div className="token-modal-overlay" onClick={onClose}>
            <div className="token-modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Select a Token</h2>

                {/* Search Input */}
                <input
                    type="text"
                    placeholder="Search by token or paste address..."
                    className="token-search"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                />

                {/* Token List */}
                <ul className="token-list">
                    {sortedTokens.length === 0 ? (
                        <p className="no-tokens">No tokens found.</p>
                    ) : sortedTokens.map((token) => (
                        <li
                            key={token.mint}
                            className="token-item"
                            onClick={() => {
                                handleCoinSelect(token, type);
                                onClose();
                            }}
                        >
                            <img 
                                src={token.logoURI || `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/${token.mint}/logo.png`} 
                                alt={token.symbol} 
                                className="token-logo"
                                onError={(e) => e.target.style.display = "none"} // Hide broken images
                            />
                            <div className="token-info">
                                {/* <span className="token-name">{token.name}</span> */}
                                <span className="token-symbol">{token.symbol}</span>
                            </div>
                            {token.amount > 0 && (
                                <span className="token-amount">{parseFloat(token.amount).toFixed(2)}</span>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default TokenModal;