import React, { useState, useEffect } from "react";
import CryptoTrade from "@/components/Crypto_components/CryptoTrade";
import CryptoWallet from "@/components/Crypto_components/CryptoWallet";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import "@/css/pages/Trade.css";

const SOLANA_RPC_URL = "https://solana-mainnet.g.alchemy.com/v2/dhWoE-s3HVNfalBWpWnzRIWfyJIqTamF"; // Solana Mainnet RPC
// const SOLANA_RPC_URL = "https://solana-mainnet.rpcpool.com";


function Trade() {
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [buyingCoin, setBuyingCoin] = useState(null);
    const [sellAmount, setSellAmount] = useState("");
    const [buyAmount, setBuyAmount] = useState("");
    const [walletTokens, setWalletTokens] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sellDropdownVisible, setSellDropdownVisible] = useState(false);
    const [buyDropdownVisible, setBuyDropdownVisible] = useState(false);
    const wallet = useWallet();
    const [walletMenuVisible, setWalletMenuVisible] = useState(false);
    const [quote, setQuote] = useState(null);
    const [loadingQuote, setLoadingQuote] = useState(false);
    const [swapTransaction, setSwapTransaction] = useState(null);
    const [isSwapping, setIsSwapping] = useState(false);

    useEffect(() => {
        if (wallet.connected && wallet.publicKey) {
            fetchWalletTokens();
        }
    }, [wallet.connected]);

    const fetchWalletTokens = async () => {
        const connection = new Connection(SOLANA_RPC_URL);
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


    // 🔹 Fetch swap quote from Jupiter API
    useEffect(() => {
        if (selectedCoin && buyingCoin && sellAmount) {
            fetchSwapQuote();
        }
    }, [selectedCoin, buyingCoin, sellAmount]);

    const fetchSwapQuote = async () => {
        if (!wallet.publicKey) return;

        setLoadingQuote(true);
        try {
            const response = await fetch(
                `https://quote-api.jup.ag/v6/quote?inputMint=${selectedCoin.mint}&outputMint=${buyingCoin.mint}&amount=${sellAmount * 1e9}&slippageBps=50`
            );

            const data = await response.json();
            console.log("🔹 Swap Quote:", data);
            setQuote(data);
            setBuyAmount((data.outAmount / 1e9).toFixed(6));
        } catch (error) {
            console.error("🚨 Failed to fetch swap quote:", error);
        } finally {
            setLoadingQuote(false);
        }
    };

    // 🔹 Execute swap transaction with Jupiter API
    const executeSwap = async () => {
        if (!wallet.publicKey || !quote) return;
        setIsSwapping(true);

        try {
            const swapResponse = await fetch("https://quote-api.jup.ag/v6/swap", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userPublicKey: wallet.publicKey.toBase58(),
                    quoteResponse: quote,
                }),
            });

            const { swapTransaction } = await swapResponse.json();
            setSwapTransaction(swapTransaction);

            // 🔥 Decode transaction and sign with wallet
            const connection = new Connection(SOLANA_RPC_URL);
            const transaction = Transaction.from(Buffer.from(swapTransaction, "base64"));
            const signedTransaction = await wallet.signTransaction(transaction);

            // 🔥 Send the signed transaction
            const signature = await connection.sendRawTransaction(signedTransaction.serialize());
            await connection.confirmTransaction(signature, "processed");

            console.log("✅ Swap Successful:", `https://explorer.solana.com/tx/${signature}?cluster=mainnet-beta`);
            alert(`Swap Successful! Check Explorer: https://explorer.solana.com/tx/${signature}?cluster=mainnet-beta`);
        } catch (error) {
            console.error("🚨 Swap failed:", error);
        } finally {
            setIsSwapping(false);
        }
    };

    
    
    
    const handleSwap = async () => {
        if (!wallet.connected) {
            toast.error("Please connect your wallet first.");
            return;
        }
        if (!selectedCoin || !buyingCoin) {
            toast.error("Select tokens to swap.");
            return;
        }
        if (!sellAmount || parseFloat(sellAmount) <= 0) {
            toast.error("Enter a valid amount.");
            return;
        }

        setLoading(true);
        try {
            // Call Jupiter Swap API (or direct Solana transaction)
            // TODO: Integrate real swap logic using Jupiter API
            console.log("Swapping", sellAmount, selectedCoin.symbol, "for", buyingCoin.symbol);

            toast.success(`Successfully swapped ${sellAmount} ${selectedCoin.symbol} for ${buyingCoin.symbol}!`);
        } catch (error) {
            console.error("Swap failed:", error);
            toast.error("Swap failed. Please try again.");
        } finally {
            setLoading(false);
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
            <h2>Swap with SolPulse</h2>
            <p>Connect your wallet and trade your favorite cryptocurrencies.</p>

            <div className="swap-section">
                <div className="swap-box">
                    <label>You're Selling</label>
                    <div className="coin-input-wrapper" onClick={() => setSellDropdownVisible(!sellDropdownVisible)}>
                        <button className="coin-select-button">
                            {selectedCoin ? selectedCoin.symbol : "Select Coin"} ▼
                        </button>
                        <input type="text" placeholder="0.00" value={sellAmount} onChange={(e) => setSellAmount(e.target.value)} />
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
                        <input type="text" placeholder="0.00" value={buyAmount} readOnly />
                    </div>
                </div>

                {loadingQuote ? <p>Loading quote...</p> : <p>Expected Output: {buyAmount} {buyingCoin?.symbol}</p>}

                <button className="swap-button" onClick={handleSwap} disabled={isSwapping || !quote}>
                    {isSwapping ? "Swapping..." : "Swap"}
                </button>
            </div>

            {wallet.connected && <CryptoWallet walletConnected={wallet.connected} />}
        </div>
    );
}
export default Trade;










{/* //     return (
//         <div className="trade-crypto-container">
//             <div className="wallet-button-wrapper">
//                 <button  */}
//                     className="connect-wallet-button" 
//                     onClick={() => setWalletMenuVisible(!walletMenuVisible)}
//                 >
//                     {wallet.connected 
//                         ? wallet.publicKey?.toString().slice(0, 6) + "..." + wallet.publicKey?.toString().slice(-4) 
//                         : "Connect Wallet"}
//                 </button>

//                 {walletMenuVisible && (
//                     <div className="wallet-options-dropdown">
//                         {!wallet.connected ? (
//                             <>
//                                 <button onClick={async () => {
//                                     try {
//                                         await wallet.select("Phantom");
//                                         await wallet.connect();
//                                         setWalletMenuVisible(false); // Close dropdown after connection
//                                     } catch (error) {
//                                         console.error("Wallet connection failed:", error);
//                                     }
//                                 }}>
//                                     Connect with Phantom
//                                 </button>
//                                 <button onClick={async () => {
//                                     try {
//                                         await wallet.select("Solflare");
//                                         await wallet.connect();
//                                         setWalletMenuVisible(false); // Close dropdown after connection
//                                     } catch (error) {
//                                         console.error("Wallet connection failed:", error);
//                                     }
//                                 }}>
//                                     Connect with Solflare
//                                 </button>
//                             </>
//                         ) : (
//                             <button onClick={async () => {
//                                 try {
//                                     await wallet.disconnect();
//                                     setWalletTokens([]);
//                                     setSelectedCoin(null);
//                                     setBuyingCoin(null);
//                                     setWalletMenuVisible(false); // Close dropdown after disconnection
//                                 } catch (error) {
//                                     console.error("Wallet disconnection failed:", error);
//                                 }
//                             }}>
//                                 Disconnect Wallet
//                             </button>
//                         )}
//                     </div>
//                 )}
//             </div>
//             <h2>Swap with SolPulse</h2>
//             <p>Connect your wallet and trade your favorite cryptocurrencies.</p>

//             <div className="swap-section">
//             <div className="swap-box">
//                 <label>You're Selling</label>
//                 <div 
//                     className="coin-input-wrapper" 
//                     onClick={(e) => {
//                         e.stopPropagation();
//                         setSellDropdownVisible(!sellDropdownVisible);
//                     }}
//                 >
//                     <button className="coin-select-button">
//                         {selectedCoin ? selectedCoin.symbol : "Select Coin"} ▼
//                     </button>
//                     <input
//                         type="text"
//                         placeholder="0.00"
//                         value={sellAmount}
//                         onChange={(e) => setSellAmount(e.target.value)}
//                         onClick={(e) => e.stopPropagation()} // Prevent closing on input click
//                     />
//                 </div>
//                 {sellDropdownVisible && (
//                     <ul className="coin-dropdown">
//                         {walletTokens.map((token) => (
//                             <li key={token.mint} onClick={() => handleCoinSelect(token, "sell")}>
//                                 {token.symbol} - {token.amount}
//                             </li>
//                         ))}
//                     </ul>
//                 )}
//             </div>

//                 <div className="swap-box">
//                     <label>You're Buying</label>
//                     <div className="coin-input-wrapper" onClick={() => setBuyDropdownVisible(!buyDropdownVisible)}>
//                         <button className="coin-select-button">
//                             {buyingCoin ? buyingCoin.symbol : "Select Coin"} ▼
//                         </button>
//                         <input
//                             type="text"
//                             placeholder="0.00"
//                             value={buyAmount}
//                             onChange={(e) => setBuyAmount(e.target.value)}
//                             onClick={(e) => e.stopPropagation()} // Prevent dropdown from closing
//                         />
//                     </div>
//                     {buyDropdownVisible && (
//                         <ul className="coin-dropdown">
//                             {walletTokens.map((token) => (
//                                 <li key={token.mint} onClick={() => handleCoinSelect(token, "buy")}>
//                                     {token.symbol} - {token.amount}
//                                 </li>
//                             ))}
//                         </ul>
//                     )}
//                 </div>

//                 <button className="swap-button">Swap</button>
//             </div>
//            {wallet.connected && <CryptoWallet walletConnected={wallet.connected} />}
//         </div>
//     );
// }


