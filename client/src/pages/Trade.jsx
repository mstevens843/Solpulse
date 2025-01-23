import React, { useState, useEffect } from "react";
import CryptoTrade from "@/components/CryptoTrade";
import CryptoWallet from "@/components/CryptoWallet";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import "@/css/pages/Trade.css";

function Trade() {
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [buyingCoin, setBuyingCoin] = useState(null);
    const [sellAmount, setSellAmount] = useState("");
    const [buyAmount, setBuyAmount] = useState("");
    const [walletTokens, setWalletTokens] = useState([]);
    const [sellDropdownVisible, setSellDropdownVisible] = useState(false);
    const [buyDropdownVisible, setBuyDropdownVisible] = useState(false);
    const wallet = useWallet();
    const [walletMenuVisible, setWalletMenuVisible] = useState(false);

    useEffect(() => {
        if (wallet.connected && wallet.publicKey) {
            fetchWalletTokens();
        }
    }, [wallet.connected]);

    const fetchWalletTokens = async () => {
        const connection = new Connection("https://api.mainnet-beta.solana.com");
        try {
            const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
                new PublicKey(wallet.publicKey),
                { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") }
            );

            const tokens = tokenAccounts.value.map((account) => {
                const info = account.account.data.parsed.info;
                return {
                    mint: info.mint,
                    amount: info.tokenAmount.uiAmount,
                    symbol: info.mint.slice(0, 6), // Placeholder symbol
                };
            });

            setWalletTokens(tokens);
        } catch (error) {
            console.error("Failed to fetch wallet tokens:", error);
        }
    };

    // Add this effect to handle clicks outside the dropdowns
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (!event.target.closest(".coin-input-wrapper")) {
                setSellDropdownVisible(false);
                setBuyDropdownVisible(false);
            }
        };

        document.addEventListener("click", handleOutsideClick);
        return () => document.removeEventListener("click", handleOutsideClick);
    }, []);

    const handleCoinSelect = (coin, type) => {
        if (type === "sell") {
            setSelectedCoin(coin);
            setSellDropdownVisible(false);
        } else {
            setBuyingCoin(coin);
            setBuyDropdownVisible(false);
        }
    };

    return (
        <div className="trade-crypto-container">
            <div className="wallet-button-wrapper">
                <button 
                    className="connect-wallet-button" 
                    onClick={() => setWalletMenuVisible(!walletMenuVisible)}
                >
                    {wallet.connected 
                        ? wallet.publicKey?.toString().slice(0, 6) + "..." + wallet.publicKey?.toString().slice(-4) 
                        : "Connect Wallet"}
                </button>

                {walletMenuVisible && (
                    <div className="wallet-options-dropdown">
                        {!wallet.connected ? (
                            <>
                                <button onClick={async () => {
                                    try {
                                        await wallet.select("Phantom");
                                        await wallet.connect();
                                        setWalletMenuVisible(false); // Close dropdown after connection
                                    } catch (error) {
                                        console.error("Wallet connection failed:", error);
                                    }
                                }}>
                                    Connect with Phantom
                                </button>
                                <button onClick={async () => {
                                    try {
                                        await wallet.select("Solflare");
                                        await wallet.connect();
                                        setWalletMenuVisible(false); // Close dropdown after connection
                                    } catch (error) {
                                        console.error("Wallet connection failed:", error);
                                    }
                                }}>
                                    Connect with Solflare
                                </button>
                            </>
                        ) : (
                            <button onClick={async () => {
                                try {
                                    await wallet.disconnect();
                                    setWalletTokens([]);
                                    setSelectedCoin(null);
                                    setBuyingCoin(null);
                                    setWalletMenuVisible(false); // Close dropdown after disconnection
                                } catch (error) {
                                    console.error("Wallet disconnection failed:", error);
                                }
                            }}>
                                Disconnect Wallet
                            </button>
                        )}
                    </div>
                )}
            </div>
            <h2>Swap with SolPulse</h2>
            <p>Connect your wallet and trade your favorite cryptocurrencies.</p>

            <div className="swap-section">
            <div className="swap-box">
                <label>You're Selling</label>
                <div 
                    className="coin-input-wrapper" 
                    onClick={(e) => {
                        e.stopPropagation();
                        setSellDropdownVisible(!sellDropdownVisible);
                    }}
                >
                    <button className="coin-select-button">
                        {selectedCoin ? selectedCoin.symbol : "Select Coin"} ▼
                    </button>
                    <input
                        type="text"
                        placeholder="0.00"
                        value={sellAmount}
                        onChange={(e) => setSellAmount(e.target.value)}
                        onClick={(e) => e.stopPropagation()} // Prevent closing on input click
                    />
                </div>
                {sellDropdownVisible && (
                    <ul className="coin-dropdown">
                        {walletTokens.map((token) => (
                            <li key={token.mint} onClick={() => handleCoinSelect(token, "sell")}>
                                {token.symbol} - {token.amount}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

                <div className="swap-box">
                    <label>You're Buying</label>
                    <div className="coin-input-wrapper" onClick={() => setBuyDropdownVisible(!buyDropdownVisible)}>
                        <button className="coin-select-button">
                            {buyingCoin ? buyingCoin.symbol : "Select Coin"} ▼
                        </button>
                        <input
                            type="text"
                            placeholder="0.00"
                            value={buyAmount}
                            onChange={(e) => setBuyAmount(e.target.value)}
                            onClick={(e) => e.stopPropagation()} // Prevent dropdown from closing
                        />
                    </div>
                    {buyDropdownVisible && (
                        <ul className="coin-dropdown">
                            {walletTokens.map((token) => (
                                <li key={token.mint} onClick={() => handleCoinSelect(token, "buy")}>
                                    {token.symbol} - {token.amount}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <button className="swap-button">Swap</button>
            </div>
          // {wallet.connected && <CryptoWallet walletConnected={wallet.connected} />}
        </div>
    );
}

export default Trade;

