import React, { useState, useEffect, useMemo, useCallback } from "react";
import CryptoTrade from "@/components/Crypto_components/CryptoTrade";
import TokenModal from "@/components/Crypto_components/TokenModal";
import CryptoWallet from "@/components/Crypto_components/CryptoWallet";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { debounce } from "lodash";
import "@/css/pages/Trade.css";

const SOLANA_RPC_URL = "https://solana-mainnet.g.alchemy.com/v2/dhWoE-s3HVNfalBWpWnzRIWfyJIqTamF"; // Solana Mainnet RPC
// const SOLANA_RPC_URL = "https://solana-mainnet.rpcpool.com";
const SOLANA_TOKEN_LIST_URL = "https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json";




function Trade() {
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [buyingCoin, setBuyingCoin] = useState(null);
    const [sellAmount, setSellAmount] = useState("");
    // const [buyAmount, setBuyAmount] = useState("");
    const [walletTokens, setWalletTokens] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sellDropdownVisible, setSellDropdownVisible] = useState(false);
    const [buyDropdownVisible, setBuyDropdownVisible] = useState(false);
    const [walletTokensFetched, setWalletTokensFetched] = useState(false);
    const wallet = useWallet();
const [isModalOpen, setIsModalOpen] = useState(false);
const [modalType, setModalType] = useState(""); // "sell" or "bu
    const [walletMenuVisible, setWalletMenuVisible] = useState(false);
    const [quote, setQuote] = useState(null);
    const [loadingQuote, setLoadingQuote] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [swapTransaction, setSwapTransaction] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [displayedTokenCount, setDisplayedTokenCount] = useState(10); // Start with 10 tokens
    const [walletConnected, setWalletConnected] = useState(false);
    const [isSwapping, setIsSwapping] = useState(false);
    const [tokenMap, setTokenMap] = useState({});

    const memoizedWalletTokens = useMemo(() => walletTokens, [walletTokens]);

    const cleanMintAddress = (address) => {
        return address.replace(/pump$/i, ""); // 🔥 Removes "pump" suffix (case insensitive)
    };

    const handleCoinSelect = (token, type) => {
        if (type === "sell") {
            setSelectedCoin(token);
            setSellDropdownVisible(false);  // Close dropdown
        } else {
            setBuyingCoin(token);
            setBuyDropdownVisible(false);  // Close dropdown
        }
        setSearchTerm(""); // Clear search input after selection
    }; 


    

    const [page, setPage] = useState(1);
    const pageSize = 200; // ✅ Show only 50 tokens at a time
    
    const filteredTokens = useMemo(() => {
        if (!searchTerm) return walletTokens.slice(0, page * pageSize);
        
        return walletTokens
            .filter(token => token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             token.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
            .slice(0, page * pageSize); // ✅ Only load up to `page * pageSize` results
    }, [searchTerm, walletTokens, page]);
    
        const loadMoreTokens = () => {
            setDisplayedTokenCount((prev) => prev + 10); // Load 10 more at a time
        };

        const displayedTokens = filteredTokens.slice(0, displayedTokenCount);

    

    // ✅ Add `handleKeyDown` right after `handleCoinSelect`
    const handleKeyDown = (event, type) => {
        if (event.key === "ArrowDown") {
            setHighlightedIndex((prev) => Math.min(prev + 1, filteredTokens.length - 1));
        } else if (event.key === "ArrowUp") {
            setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        } else if (event.key === "Enter") {
            if (filteredTokens[highlightedIndex]) {
                handleCoinSelect(filteredTokens[highlightedIndex], type);
            }
        }
    };

    const computedBuyAmount = useMemo(() => {
        if (!quote) return "";
        return (quote.outAmount / 1e9).toFixed(6);  // Convert lamports to SOL
    }, [quote]);

    const updateTokenMap = useCallback((tokenLookup) => {
        setTokenMap(tokenLookup);
        localStorage.setItem("tradableTokens", JSON.stringify(tokenLookup)); // ✅ Cache tokens
    }, []);

   

    useEffect(() => {
        if (wallet.connected && wallet.publicKey && !walletTokensFetched) {
            fetchWalletTokens();
        } else {
            // ✅ Always show top tokens even if wallet isn't connected
            setWalletTokens(prevTokens => [
                ...prevTokens,
                ...TOP_TOKENS.filter(t => !prevTokens.some(p => p.mint === t.mint))
            ]);
        }
    }, [wallet.connected, walletTokensFetched]);
    

 
    


    // Fetch token names from the Jupiter API
     // Fetch token names from the Jupiter API

    //  const fetchTokenInformation = async (mintAddress) => {
    //     try {
    //         const response = await fetch(`https://api.jup.ag/tokens/v1/token/${mintAddress}`);
    //         if (!response.ok) throw new Error("Token not found");
            
    //         const tokenInfo = await response.json();
    
    //         // Store the new token in the tokenMap to avoid fetching again
    //         setTokenMap(prevMap => ({
    //             ...prevMap,
    //             [mintAddress]: { name: tokenInfo.name, symbol: tokenInfo.symbol }
    //         }));
    
    //         return { name: tokenInfo.name, symbol: tokenInfo.symbol };
    //     } catch (error) {
    //         console.error(`❌ Failed to fetch token info for ${mintAddress}:`, error);
    //         return { name: "Unknown Token", symbol: mintAddress.slice(0, 6) };
    //     }
    // };

    const TOP_TOKENS = [
        // { mint: "JUPpGJbKpW1XsDTo1HnyefFoZiKjtBZiE5TfkiQ7vLQ", name: "Jupiter", symbol: "JUP", logoURI: "https://assets.coingecko.com/coins/images/16500/small/jupiter.png" },
        // { mint: "So11111111111111111111111111111111111111112", name: "Solana", symbol: "SOL", logoURI: "https://assets.coingecko.com/coins/images/4128/small/solana.png" },
        // { mint: "hntyVPJ2GzqFRAm1Y2hVh6L9NAgC7oe5zF5hKJfuU4U", name: "Helium", symbol: "HNT", logoURI: "https://assets.coingecko.com/coins/images/4284/small/helium.png" },
        // { mint: "FsSMkUvQRZRPmUgfax8fCp1UMiEuES9hFQf3EabLkpSg", name: "Pyth", symbol: "PYTH", logoURI: "https://assets.coingecko.com/coins/images/20622/small/pyth.png" },
        // { mint: "RNDR3o1NY9MhhTkTzQhZWomk9EytD6Zb6dM8E1DthJw", name: "Render", symbol: "RNDR", logoURI: "https://assets.coingecko.com/coins/images/11636/small/render.png" },
        // { mint: "bonkMTziWN1SsyMFAGiAqHQvF4jA74N7MrAN3jZfAb7", name: "Bonk", symbol: "BONK", logoURI: "https://assets.coingecko.com/coins/images/28566/small/bonk.png" },
        // { mint: "popcatqVJnPdZZqtfAs5Ra86cZNSqDoPUtGqZNoja4z", name: "Popcat", symbol: "POPCAT", logoURI: "https://assets.coingecko.com/coins/images/30127/small/popcat.png" }
    ];
    

    // ** ✅ Fetch Solana Labs Token List (metadata) */
    const fetchTokenList = async () => {
        const cachedTokens = localStorage.getItem("solanaTokenList");
    
        if (cachedTokens) {
            const tokenData = JSON.parse(cachedTokens);
    
            // ✅ Merge top tokens into cached token data
            TOP_TOKENS.forEach(token => {
                tokenData[token.mint] = {
                    name: token.name,
                    symbol: token.symbol,
                    logoURI: token.logoURI,
                };
            });
    
            setTokenMap(tokenData);
            console.log("✅ Loaded token list from cache with top tokens merged.");
            return;
        }
    
        try {
            console.log("🔄 Fetching Solana token list...");
            const response = await fetch(SOLANA_TOKEN_LIST_URL);
            if (!response.ok) throw new Error("Token list fetch failed.");
            const data = await response.json();
    
            // ✅ Convert to lookup table
            const tokenLookup = {};
            data.tokens.forEach((token) => {
                tokenLookup[token.address] = {
                    name: token.name,
                    symbol: token.symbol,
                    logoURI: token.logoURI || "",
                };
            });
    
            // ✅ Merge `TOP_TOKENS` to **guarantee their presence**
            TOP_TOKENS.forEach(token => {
                tokenLookup[token.mint] = {
                    name: token.name,
                    symbol: token.symbol,
                    logoURI: token.logoURI,
                };
            });
    
            // ✅ Ensure USDC is always included
            if (!tokenLookup["EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"]) {
                tokenLookup["EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"] = {
                    name: "USD Coin",
                    symbol: "USDC",
                    logoURI: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
                };
            }
    
            // ✅ Ensure JUPITER ($JUP) is included
            if (!tokenLookup["JUPpGJbKpW1XsDTo1HnyefFoZiKjtBZiE5TfkiQ7vLQ"]) {
                tokenLookup["JUPpGJbKpW1XsDTo1HnyefFoZiKjtBZiE5TfkiQ7vLQ"] = {
                    name: "Jupiter",
                    symbol: "JUP",
                    logoURI: "https://assets.coingecko.com/coins/images/16500/small/jupiter.png",
                };
            }
    
            // ✅ Ensure SOLANA ($SOL) is included
            if (!tokenLookup["So11111111111111111111111111111111111111112"]) {
                tokenLookup["So11111111111111111111111111111111111111112"] = {
                    name: "Solana",
                    symbol: "SOL",
                    logoURI: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
                };
            }
    
            // ✅ Ensure HELIUM ($HNT) is included
            if (!tokenLookup["hntyVPJ2GzqFRAm1Y2hVh6L9NAgC7oe5zF5hKJfuU4U"]) {
                tokenLookup["hntyVPJ2GzqFRAm1Y2hVh6L9NAgC7oe5zF5hKJfuU4U"] = {
                    name: "Helium",
                    symbol: "HNT",
                    logoURI: "https://assets.coingecko.com/coins/images/4284/small/helium.png",
                };
            }

            if (!tokenLookup["2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv"]) {
                tokenLookup["2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv"] = {
                    name: "PENGU",
                    symbol: "PENGU",
                    logoURI: "https://assets.coingecko.com/coins/images/31224/small/pengu.png",
                };
            }

             // ✅ Debugging: Check if tokens exist in tokenMap
            console.log("✅ Checking Token Map:");
            console.log("USDC:", tokenLookup["EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"]);
            console.log("Jupiter:", tokenLookup["JUPpGJbKpW1XsDTo1HnyefFoZiKjtBZiE5TfkiQ7vLQ"]);
            console.log("PENGU:", tokenLookup["2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv"]);

            
    
            setTokenMap(tokenLookup);
            localStorage.setItem("solanaTokenList", JSON.stringify(tokenLookup));
            console.log("✅ Token list updated with top tokens.");
        } catch (error) {
            console.error("❌ Failed to fetch Solana token list:", error);
        }
    };
    
    
    
    
    useEffect(() => {
        fetchTokenList();
    }, []);

    const handleSearchToken = debounce(async (query) => {
        if (!query) return;
    
        // ✅ Check if the token is already cached in `tokenMap`
        if (tokenMap[query]) {
            console.log(`✅ Found cached token: ${tokenMap[query].name}`);
            return;
        }
    
        try {
            console.log(`🔄 Searching for token: ${query}...`);
    
            // 🔍 Fetch from Solana token list
            const solanaResponse = await fetch(SOLANA_TOKEN_LIST_URL);
            if (!solanaResponse.ok) throw new Error("Solana token fetch failed.");
            const solanaData = await solanaResponse.json();
    
            const solanaToken = solanaData.tokens.find(token =>
                token.name.toLowerCase().includes(query.toLowerCase()) ||
                token.symbol.toLowerCase().includes(query.toLowerCase())
            );
    
            if (solanaToken) {
                setTokenMap(prev => ({
                    ...prev,
                    [solanaToken.address]: {
                        name: solanaToken.name,
                        symbol: solanaToken.symbol,
                        logoURI: solanaToken.logoURI || "",
                    }
                }));
                console.log(`✅ Found in Solana list: ${solanaToken.name}`);
                return;
            }
    
            // 🔍 Fetch from CoinGecko
            const coingeckoResponse = await fetch(`https://api.coingecko.com/api/v3/search?query=${query}`);
            if (!coingeckoResponse.ok) throw new Error("CoinGecko search failed.");
            const coingeckoData = await coingeckoResponse.json();
    
            if (coingeckoData.coins.length > 0) {
                const coin = coingeckoData.coins[0];
                setTokenMap(prev => ({
                    ...prev,
                    [coin.id]: {
                        name: coin.name,
                        symbol: coin.symbol,
                        logoURI: coin.large,
                    }
                }));
                console.log(`✅ Found in CoinGecko: ${coin.name}`);
                return;
            }
    
            console.warn("⚠️ No matching token found.");
        } catch (error) {
            console.error("❌ Failed to fetch token info:", error);
        }
    }, 500);
    
    

    // const fetchTradableTokens = async () => {
    //     if (Object.keys(tokenMap).length > 0) {
    //         console.log("⚠️ Skipping fetch - tokens already loaded.");
    //         return;
    //     }
    
    //     const cachedTokens = localStorage.getItem("tradableTokens");
    //     if (cachedTokens) {
    //         console.log("🛑 Loading tokens from cache...");
    //         updateTokenMap(JSON.parse(cachedTokens));
    //         return;
    //     }
    
    //     try {
    //         console.log("🔄 Fetching tradable tokens...");
    
    //         // ✅ Step 1: Fetch tradable mints (limit 100)
    //         const tradableResponse = await fetch("https://api.jup.ag/tokens/v1/mints/tradable", {
    //             headers: { "x-api-key": process.env.VITE_JUP_API_KEY || "" }  // 🔑 Add API Key if needed
    //         });
    
    //         if (!tradableResponse.ok) throw new Error("Tradable tokens API failed.");
    //         let tradableMints = await tradableResponse.json();
    //         tradableMints = tradableMints.slice(0, 100);  // ✅ Limit for performance
    
    //         console.log("🔍 Tradable Mints:", tradableMints);
    
    //         // ✅ Step 2: Fetch all token details
    //         const tokenInfoResponse = await fetch("https://api.jup.ag/tokens/v1/all", {
    //             headers: { "x-api-key": process.env.VITE_JUP_API_KEY || "" }  // 🔑 Add API Key if needed
    //         });
    
    //         if (!tokenInfoResponse.ok) throw new Error("Token info API failed.");
    //         const tokenInfo = await tokenInfoResponse.json();
    
    //         if (!Array.isArray(tokenInfo) || tokenInfo.length === 0) {
    //             throw new Error("⚠️ Token info API returned an empty list.");
    //         }
    
    //         // ✅ Step 3: Create a lookup table for quick address-to-token mapping
    //         const tokenLookup = {};
    //         tokenInfo.forEach(token => {
    //             tokenLookup[token.address] = { 
    //                 name: token.name || "Unknown Token", 
    //                 symbol: token.symbol || "?", 
    //                 logoURI: token.logoURI 
    //             };
    //         });
    
    //         console.log("✅ Processed Token Lookup:", tokenLookup);
    
    //         // ✅ Step 4: Find unmatched tokens
    //         const unmatchedTokens = tradableMints.filter(mint => !tokenLookup[mint]);
    //         console.log(`⚠️ Unmatched Tokens: ${unmatchedTokens.length}/${tradableMints.length}`, unmatchedTokens);
    
    //         // ✅ Step 5: Ensure all tradable tokens have proper names
    //         tradableMints.forEach(mint => {
    //             if (!tokenLookup[mint]) {
    //                 tokenLookup[mint] = { 
    //                     name: `Token (${mint.slice(0, 4)}...)`,  // 🔄 Fallback: Show partial Mint Address
    //                     symbol: mint.slice(0, 6), 
    //                     logoURI: null 
    //                 };
    //             }
    //         });
    
    //         console.log("✅ Final Token Lookup:", tokenLookup);
    
    //         // ✅ Step 6: Update tokenMap with all known tokens
    //         updateTokenMap(tokenLookup);
    //         localStorage.setItem("tradableTokens", JSON.stringify(tokenLookup));
    //         console.log("✅ Tradable token map updated and stored in localStorage.");
    
    //     } catch (error) {
    //         console.error("❌ Failed to fetch tradable tokens:", error);
    //     }
    // };
    
    // // Fetch tradable tokens on mount
    // useEffect(() => {
    //     fetchTradableTokens();
    // }, []);



    //  const fetchTokenNames = async () => {
    //     try {
    //         const response = await fetch("https://token.jup.ag/strict");
    //         const tokens = await response.json();
    
    //         // Map token addresses to token names and symbols
    //         const tokenLookup = tokens.reduce((acc, token) => {
    //             acc[token.address] = { name: token.name, symbol: token.symbol };
    //             return acc;
    //         }, {});
    
    //         setTokenMap(tokenLookup);
    //     } catch (error) {
    //         console.error("❌ Failed to fetch token names:", error);
    //     }=
    // };

    // useEffect(() => {
    //     fetchTokenNames();
    // }, []);

    const fetchWalletTokens = async () => {
        if (!wallet.publicKey || walletTokensFetched) return;
    
        const connection = new Connection(SOLANA_RPC_URL);
        try {
            console.log("🔄 Fetching wallet tokens...");
            const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
                new PublicKey(wallet.publicKey),
                { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") }
            );
    
            const tokens = tokenAccounts.value.map((account) => {
                const info = account.account.data.parsed.info;
                const mintAddress = info.mint;
    
                // ✅ Ensure we use tokenMap data for name/symbol
                const tokenData = tokenMap[mintAddress] || TOP_TOKENS.find(t => t.mint === mintAddress) || {
                    name: "Unknown Token",
                    symbol: mintAddress.slice(0, 6),
                    logoURI: "",
                };
    
                return {
                    mint: mintAddress,
                    amount: info.tokenAmount.uiAmount,
                    name: tokenData.name,
                    symbol: tokenData.symbol,
                    logoURI: tokenData.logoURI
                };
            });
    
            setWalletTokens(tokens);
            setWalletTokensFetched(true);
            console.log("✅ Wallet tokens + essential tokens fetched:", tokens.length);
        } catch (error) {
            console.error("❌ Failed to fetch wallet tokens:", error);
        }
    };
    
    
    
    
    // 2️⃣ Fetch Swap Instructions from Jupiter
    const fetchSwapInstructions = async () => {
        if (!wallet.publicKey || !quote) {
            console.warn("⚠️ Missing required parameters for swap instructions.");
            return null;
        }
    
        try {
            console.log("🔄 Fetching swap instructions from Jupiter...");
            const instructionResponse = await fetch("https://quote-api.jup.ag/v6/swap-instructions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": process.env.VITE_JUP_API_KEY || "", // ✅ Ensure API key is used
                },
                body: JSON.stringify({
                    userPublicKey: wallet.publicKey.toBase58(),
                    wrapAndUnwrapSol: true,
                    useSharedAccounts: true,
                    prioritizationFeeLamports: 0,
                    asLegacyTransaction: false,
                    useTokenLedger: false,
                    dynamicComputeUnitLimit: true,
                    skipUserAccountsRpcCalls: true,
                    dynamicSlippage: true,
                    quoteResponse: quote, // ✅ Ensures quote is correctly passed
                }),
            });
    
            if (!instructionResponse.ok) throw new Error(`Swap instructions failed. Status: ${instructionResponse.status}`);
    
            const instructions = await instructionResponse.json();
            console.log("✅ Swap Instructions:", instructions);
            return instructions;
        } catch (error) {
            console.error("🚨 Failed to fetch swap instructions:", error);
            alert("⚠️ Unable to fetch swap instructions. Please try again later.");
            return null;
        }
    };
    
    
    // 3️⃣ Execute Swap Transaction
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
    
            if (!swapResponse.ok) throw new Error("Swap request failed.");
    
            const { swapTransaction } = await swapResponse.json();
            const connection = new Connection(SOLANA_RPC_URL);
            const transaction = Transaction.from(Buffer.from(swapTransaction, "base64"));
    
            const signedTransaction = await wallet.signTransaction(transaction);
            const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    
            console.log("✅ Swap Submitted:", `https://explorer.solana.com/tx/${signature}?cluster=mainnet-beta`);
    
            // ✅ Confirm transaction before showing success
            await connection.confirmTransaction(signature, "confirmed");
    
            alert(`✅ Swap Successful! View transaction: https://explorer.solana.com/tx/${signature}?cluster=mainnet-beta`);
        } catch (error) {
            console.error("❌ Swap failed:", error);
            alert("⚠️ Swap failed. Please check your connection and try again.");
        } finally {
            setIsSwapping(false);
        }
    };
    
    
    // const handleSwap = async () => {
    //     if (!wallet.connected) {
    //         toast.error("Please connect your wallet first.");
    //         return;
    //     }
    //     if (!selectedCoin || !buyingCoin) {
    //         toast.error("Select tokens to swap.");
    //         return;
    //     }
    //     if (!sellAmount || parseFloat(sellAmount) <= 0) {
    //         toast.error("Enter a valid amount.");
    //         return;
    //     }

    //     setLoading(true);

    //     try {
    //         console.log("🔄 Fetching swap instructions...");

    //         // Call Jupiter Swap API (or direct Solana transaction)
    //         console.log("Swapping", sellAmount, selectedCoin.symbol, "for", buyingCoin.symbol);

    //         toast.success(`Successfully swapped ${sellAmount} ${selectedCoin.symbol} for ${buyingCoin.symbol}!`);
    //     } catch (error) {
    //         console.error("Swap failed:", error);
    //         toast.error("Swap failed. Please try again.");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                !event.target.closest(".coin-input-wrapper") &&
                !event.target.closest(".dropdown-container")
            ) {
                setSellDropdownVisible(false);
                setBuyDropdownVisible(false);
            }
        };
    
        document.addEventListener("click", handleOutsideClick);
        return () => document.removeEventListener("click", handleOutsideClick);
    }, []);




    return (
        <>
            {/* Token Selection Modal */}
            <TokenModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                tokens={filteredTokens} 
                handleCoinSelect={handleCoinSelect}
                type={modalType} 
                tokenLookup={tokenMap}  // ✅ Pass tokenMap as tokenLookup
            />
    
            <div className="trade-crypto-container">
                <h2>Swap with SolPulse</h2>
                <p>Connect your wallet and trade your favorite cryptocurrencies.</p>
    
                <div className="swap-section">
                    {/* Sell Token Selection */}
                    <div className="swap-box">
                        <label>You're Selling</label>
                        <div 
                            className="coin-input-wrapper" 
                            onClick={() => {
                                setModalType("sell");
                                setIsModalOpen(true);
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
                            />
                        </div>
    
                        {sellDropdownVisible && (
                            <div className="dropdown-container">
                                {/* Search Bar */}
                                <input
                                    type="text"
                                    placeholder="Search token..."
                                    className="token-search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, "sell")}  // ✅ Listen for arrow key events
                                />
                                <ul className="coin-dropdown">
                                    {filteredTokens.map((token, index) => (
                                        <li 
                                            key={token.mint} 
                                            className={index === highlightedIndex ? "highlighted" : ""}
                                            onClick={() => handleCoinSelect(token, "sell")}
                                        >
                                            {token.symbol} ({token.name}) - {token.amount}
                                        </li>
                                    ))}
                                </ul>
                                {filteredTokens.length < walletTokens.length && (
                                    <button onClick={loadMoreTokens} className="load-more-btn">
                                        Load More Tokens ▼
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
    
                    {/* Buy Token Selection */}
                    <div className="swap-box">
                        <label>You're Buying</label>
                        <div 
                            className="coin-input-wrapper" 
                            onClick={() => {
                                setModalType("buy");
                                setIsModalOpen(true);
                            }}
                        >
                            <button className="coin-select-button">
                                {buyingCoin ? buyingCoin.symbol : "Select Coin"} ▼
                            </button>
                        </div>
    
                        {buyDropdownVisible && (
                            <div className="dropdown-container">
                                {/* Search Bar */}
                                <input
                                    type="text"
                                    placeholder="Search token..."
                                    className="token-search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, "buy")}
                                />
                                <ul className="coin-dropdown">
                                    {filteredTokens.map((token, index) => (
                                        <li 
                                            key={token.mint} 
                                            className={index === highlightedIndex ? "highlighted" : ""}
                                            onClick={() => handleCoinSelect(token, "buy")}
                                        >
                                            {token.symbol} ({token.name}) - {token.amount}
                                        </li>
                                    ))}
                                </ul>
                                {filteredTokens.length < walletTokens.length && (
                                    <button onClick={loadMoreTokens} className="load-more-btn">
                                        Load More Tokens ▼
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
    
                    {/* Expected Output */}
                    {loadingQuote ? (
                        <p>Loading quote...</p>
                    ) : (
                        <p>Expected Output: {computedBuyAmount} {buyingCoin?.symbol}</p>
                    )}
    
                    {/* Swap Button */}
                    <button 
                        className="swap-button" 
                        onClick={executeSwap} 
                        disabled={isSwapping || !quote}
                    >
                        {isSwapping ? "Swapping..." : "Swap"}
                    </button>
                </div>
    
                <CryptoWallet walletConnected={walletConnected} />
            </div>
        </>
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


