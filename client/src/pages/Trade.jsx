import React, { useState, useEffect, useMemo, useCallback } from "react";
import CryptoTrade from "@/components/Crypto_components/CryptoTrade";
import TokenModal from "@/components/Crypto_components/TokenModal";
import CryptoWallet from "@/components/Crypto_components/CryptoWallet";
import { fetchTokenInfo, fetchTokenInfoByMint, fetchWalletTokens, fetchTokenPrice, fetchTokenDecimals } from "@/utils/tokenApi";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { debounce } from "lodash";
import "@/css/pages/Trade.css";

const SOLANA_RPC_URL = "https://solana-mainnet.g.alchemy.com/v2/dhWoE-s3HVNfalBWpWnzRIWfyJIqTamF"; // Solana Mainnet RPC
// const SOLANA_RPC_URL = "https://solana-mainnet.rpcpool.com";



function Trade() {
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [buyingCoin, setBuyingCoin] = useState(null);
    const [sellAmount, setSellAmount] = useState("");
    const [sellingCoin, setSellingCoin] = useState(null);
    // const [buyAmount, setBuyAmount] = useState("");
    const [walletTokens, setWalletTokens] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sellDropdownVisible, setSellDropdownVisible] = useState(false);
    const [buyDropdownVisible, setBuyDropdownVisible] = useState(false);
    const [walletTokensFetched, setWalletTokensFetched] = useState(false);
    const wallet = useWallet();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(""); // "sell" or "buy"
    const [walletMenuVisible, setWalletMenuVisible] = useState(false);
    const [quote, setQuote] = useState(null);
    const [loadingQuote, setLoadingQuote] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [swapTransaction, setSwapTransaction] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [walletConnected, setWalletConnected] = useState(false);
    const [isSwapping, setIsSwapping] = useState(false);
    const [tokenMap, setTokenMap] = useState({});
    const [buyAmount, setBuyAmount] = useState(""); 


    const memoizedWalletTokens = useMemo(() => walletTokens, [walletTokens]);

    const cleanMintAddress = (address) => {
        return address.replace(/pump$/i, ""); // 🔥 Removes "pump" suffix (case insensitive)
    };

    useEffect(() => {
        if (!wallet.connected || !wallet.publicKey) {
            console.log("⏳ Waiting for wallet connection before fetching tokens.");
            return;
        }
    
        console.log("🟢 Wallet connected, fetching tokens...");
        fetchWalletTokens(wallet.publicKey, setWalletTokens, walletTokensFetched, setWalletTokensFetched);
    }, [wallet.connected, wallet.publicKey]); 
    
    


    const computedBuyAmount = useMemo(() => {
        if (!quote || !buyingCoin) return "";
        
        const outputDecimals = quote?.outputDecimals ?? buyingCoin?.decimals ?? 5;
        
        console.log(`🧐 Computing Buy Amount: outAmount=${quote.outAmount}, outputDecimals=${outputDecimals}`);
    
        return (quote.outAmount / 10 ** outputDecimals).toFixed(outputDecimals);
    }, [quote, buyingCoin]);

    const computedSellAmount = useMemo(() => {
        if (!quote || !selectedCoin) return ""; // Changed from buyingCoin to selectedCoin
        
        const inputDecimals = quote?.inputDecimals ?? selectedCoin?.decimals ?? 5;
        
        console.log(`🧐 Computing Sell Amount: inAmount=${quote.inAmount}, inputDecimals=${inputDecimals}`);
    
        return (quote.inAmount / 10 ** inputDecimals).toFixed(inputDecimals);
    }, [quote, selectedCoin]); // Added selectedCoin to dependency array

    // const updateTokenMap = useCallback((tokenLookup) => {
    //     setTokenMap(tokenLookup);
    //     localStorage.setItem("tradableTokens", JSON.stringify(tokenLookup)); // ✅ Cache tokens
    // }, []);

    // const filteredTokens = useMemo(() => {
    //     if (!searchTerm) return walletTokens; // If no search term, show all tokens
    //     return walletTokens.filter((token) =>
    //         token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //         token.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //         token.mint.toLowerCase().includes(searchTerm.toLowerCase()) // Allow mint search
    //     );
    // }, [searchTerm, walletTokens]);


    
    
    const handleCoinSelect = async (token, type) => {
        let selectedToken = token;
    
        if (!token.name || token.name === "Unknown Token") { 
            console.log("🔍 Fetching missing token info...");
            const fetchedToken = await fetchTokenInfo(token.mint);
            
            if (fetchedToken) {
                selectedToken = {
                    ...token,
                    name: fetchedToken.name || `Token (${token.mint?.slice(0, 4)}...)`,
                    symbol: fetchedToken.symbol || token.mint?.slice(0, 6),
                    logoURI: fetchedToken.logoURI
                };
            }
        }
    
        // ✅ Fetch price and decimals dynamically
        const [tokenPrice, tokenDecimals] = await Promise.all([
            fetchTokenPrice(token.mint),
            fetchTokenDecimals(token.mint),
        ]);
    
        selectedToken = {
            ...selectedToken,
            price: tokenPrice,
            decimals: tokenDecimals
        };
    
        if (type === "sell") {
            setSelectedCoin(selectedToken);
            setSellDropdownVisible(false);
        } else {
            setBuyingCoin(selectedToken);
            setBuyDropdownVisible(false);
        }
    
        setSearchTerm("");
    };



    async function fetchWithBackoff(fn, args, retries = 3, delay = 1000) {
        try {
            const result = await fn(...args); // Ensure fn is connection.sendRawTransaction
            return result; // This should be the signature
        } catch (error) {
            if (retries > 0) {
                console.warn(`Retrying... (${retries} attempts left)`);
                await new Promise(res => setTimeout(res, delay));
                return fetchWithBackoff(fn, args, retries - 1, delay * 2); // Exponential backoff
            } else {
                throw error;
            }
        }
    }

    // ✅ Add `handleKeyDown` right after `handleCoinSelect`
    // const handleKeyDown = (event, type) => {
    //     if (event.key === "ArrowDown") {
    //         setHighlightedIndex((prev) => Math.min(prev + 1, walletTokens.length - 1));
    //     } else if (event.key === "ArrowUp") {
    //         setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    //     } else if (event.key === "Enter") {
    //         if (walletTokens[highlightedIndex]) {
    //             handleCoinSelect(walletTokens[highlightedIndex], type);
    //         }
    //     }
    // };
    
    
    // 🔹 Fetch swap quote from Jupiter API
    useEffect(() => {
        if (selectedCoin && buyingCoin && sellAmount) {
            fetchSwapQuote();
        }
    }, [selectedCoin, buyingCoin, sellAmount]);








    const fetchSwapQuote = debounce(async () => {
        if (!wallet.publicKey || !selectedCoin || !buyingCoin || !sellAmount) {
            console.warn("⚠️ Missing required parameters for swap quote.");
            return;
        }
    
        setLoadingQuote(true);
        try {
            console.log("Fetching swap quote...");
    
            const inputDecimals = selectedCoin?.decimals ?? 6;  
            const outputDecimals = buyingCoin?.decimals ?? 6;  
    
            // Convert to atomic value (Jupiter expects raw integer values)
            const amountInAtomic = Math.floor(Number(sellAmount) * 10 ** inputDecimals);
    
            console.log(`🔹 API Request: inputMint=${selectedCoin.mint}, outputMint=${buyingCoin.mint}, amount=${amountInAtomic}`);
    
            const response = await fetch(
                `https://api.jup.ag/swap/v1/quote?inputMint=${selectedCoin.mint}&outputMint=${buyingCoin.mint}&amount=${amountInAtomic}&slippageBps=50&swapMode=ExactIn`
            );
    
            if (!response.ok) throw new Error("Failed to fetch swap quote");
    
            const data = await response.json();
            console.log("🔹 Swap Quote Response:", data);
    
            // ✅ Fix: Convert `outAmount` to a number before adjusting decimals
            const parsedOutAmount = Number(data.outAmount);
            console.log(`🔹 Parsed Output Amount: ${parsedOutAmount} (Divided by ${10 ** outputDecimals})`);
    
            setQuote({
                ...data,
                outAmount: parsedOutAmount, // ✅ Keep it as a number before formatting later
                inputDecimals,
                outputDecimals, // ✅ Store decimals for later
            });
    
        } catch (error) {
            console.error("🚨 Failed to fetch swap quote:", error);
            alert("⚠️ Error fetching swap quote. Please check your network and try again.");
        } finally {
            setLoadingQuote(false);
        }
    }, 1000);
    
    
    

    useEffect(() => {
        if (quote) {
            console.log(`🔹 Quote Output Amount (Atomic): ${quote.outAmount}`);
        }
    }, [quote]);


    
    // 2️⃣ Fetch Swap Instructions from Jupiter
    const fetchSwapInstructions = async () => {
        if (!wallet.publicKey || !quote) {
            console.warn("⚠️ Missing required parameters for swap instructions.");
            return;
        }
    
        try {
            console.log("🛠 Fetching swap instructions...");
    
            // ✅ Ensure numeric fields are correctly formatted as strings
            const quoteResponse = {
                inputMint: quote.inputMint,
                inAmount: String(quote.inAmount),  // Convert to string
                outputMint: quote.outputMint,
                outAmount: String(quote.outAmount),  // Convert to string
                otherAmountThreshold: String(quote.otherAmountThreshold), // Convert to string
                swapMode: quote.swapMode,
                slippageBps: parseInt(quote.slippageBps), // Ensure integer format
                platformFee: quote.platformFee || { amount: "0", feeBps: 0 }, // Ensure default fee
                priceImpactPct: quote.priceImpactPct,
                routePlan: quote.routePlan || [], // Ensure it's an array
                contextSlot: quote.contextSlot || 0, // Provide a default value
                timeTaken: quote.timeTaken || 0, // Provide a default value
            };
    
            // ✅ Only include destinationTokenAccount if it's defined
            const bodyPayload = {
                userPublicKey: wallet.publicKey.toBase58(),
                wrapAndUnwrapSol: true,
                useSharedAccounts: true,
                prioritizationFeeLamports: 0,
                asLegacyTransaction: false,
                useTokenLedger: false,
                dynamicComputeUnitLimit: true,
                skipUserAccountsRpcCalls: false,
                dynamicSlippage: true,
                quoteResponse, // ✅ Properly formatted quoteResponse object
            };
    
            // ✅ Only add destinationTokenAccount if it's not null or undefined
            if (quote.destinationTokenAccount) {
                bodyPayload.destinationTokenAccount = quote.destinationTokenAccount;
            }
    
            console.log("🔹 Request Payload for Swap Instructions:", JSON.stringify(bodyPayload, null, 2));
    
            const instructionResponse = await fetch("https://api.jup.ag/swap/v1/swap-instructions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyPayload),
            });
    
            if (!instructionResponse.ok) {
                const errorText = await instructionResponse.text();
                throw new Error(`Swap instructions failed. Status: ${instructionResponse.status} - ${errorText}`);
            }
    
            const instructions = await instructionResponse.json();
            console.log("✅ Swap Instructions Received:", instructions);
    
            return instructions;
        } catch (error) {
            console.error("🚨 Failed to fetch swap instructions:", error);
            alert("⚠️ Unable to fetch swap instructions. Please check your network and try again.");
        }
    };
    
    
    






    // 3️⃣ Execute Swap Transaction
// 3️⃣ Execute Swap Transaction
const executeSwap = async () => {
    if (!wallet.publicKey || !quote) {
        alert("⚠️ Invalid swap details. Please check your selections.");
        return;
    }

    setIsSwapping(true);

    try {
        console.log("Executing swap...");
        const swapInstructions = await fetchSwapInstructions();
        if (!swapInstructions) throw new Error("Swap instructions not available!");

        // ✅ Construct swap request payload
        const bodyPayload = {
            userPublicKey: wallet.publicKey.toBase58(),
            wrapAndUnwrapSol: true,
            useSharedAccounts: true,
            prioritizationFeeLamports: 0,
            asLegacyTransaction: false,
            useTokenLedger: false,
            dynamicComputeUnitLimit: true,
            skipUserAccountsRpcCalls: true,
            dynamicSlippage: true,
            quoteResponse: {
                inputMint: quote.inputMint,
                inAmount: String(quote.inAmount),
                outputMint: quote.outputMint,
                outAmount: String(quote.outAmount),
                otherAmountThreshold: String(quote.otherAmountThreshold),
                swapMode: quote.swapMode,
                slippageBps: parseInt(quote.slippageBps),
                platformFee: quote.platformFee || { amount: "0", feeBps: 0 },
                priceImpactPct: quote.priceImpactPct,
                routePlan: quote.routePlan || [],
                contextSlot: quote.contextSlot || 0,
                timeTaken: quote.timeTaken || 0,
            },
        };

        console.log("🔹 Request Payload for Swap:", JSON.stringify(bodyPayload, null, 2));

        // 🔹 Send the swap request to Jupiter
        const swapResponse = await fetch("https://api.jup.ag/swap/v1/swap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyPayload),
        });

        if (!swapResponse.ok) {
            const errorText = await swapResponse.text();
            throw new Error(`Swap request failed. Status: ${swapResponse.status} - ${errorText}`);
        }

        const { swapTransaction, lastValidBlockHeight } = await swapResponse.json();
        setSwapTransaction(swapTransaction);

        // ✅ Handle Versioned Transactions
        const connection = new Connection(SOLANA_RPC_URL);
        const transactionBuffer = Buffer.from(swapTransaction, "base64");

        let transaction;
        try {
            // Try to deserialize as a Versioned Transaction first
            transaction = VersionedTransaction.deserialize(transactionBuffer);
        } catch (err) {
            console.warn("⚠️ Could not deserialize as VersionedTransaction, trying Transaction instead.");
            transaction = Transaction.from(transactionBuffer);
        }

        // Sign transaction
        const signedTransaction = await wallet.signTransaction(transaction);

        // 🔥 Serialize the transaction before sending
        const serializedTransaction = signedTransaction.serialize();

        // 🔥 Send the signed transaction with retry logic
        const signature = await fetchWithBackoff(connection.sendRawTransaction.bind(connection), [serializedTransaction]);

        console.log("🚀 Direct Signature:", signature);


        // Ensure it's a valid Base58 string
        if (typeof signature !== "string") {
            throw new Error(`Invalid signature: ${JSON.stringify(signature)}`);
        }

        // ✅ Confirm Transaction
        await connection.confirmTransaction(
            { signature, lastValidBlockHeight },
            "processed"
        );

        console.log("✅ Swap Successful:", `https://explorer.solana.com/tx/${signature}?cluster=mainnet-beta`);
        alert(`Swap Successful! Check Explorer: https://explorer.solana.com/tx/${signature}?cluster=mainnet-beta`);
    } catch (error) {
        console.error("🚨 Swap failed:", error);
        alert("⚠️ Swap failed. Please check your connection and try again.");
    } finally {
        setIsSwapping(false);
    }
};

    
    
    
    


    // useEffect(() => {
    //     const handleOutsideClick = (event) => {
    //         if (
    //             !event.target.closest(".coin-input-wrapper") &&
    //             !event.target.closest(".dropdown-container")
    //         ) {
    //             // setSellDropdownVisible(false);
    //             // setBuyDropdownVisible(false);
    //         }
    //     };
    
    //     document.addEventListener("click", handleOutsideClick);
    //     return () => document.removeEventListener("click", handleOutsideClick);
    // }, []);




    return (
        <>
            {/* Token Selection Modal */}
            <TokenModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                tokens={walletTokens}
                handleCoinSelect={(token, type) => {
                    if (type === "sell") setSelectedCoin(token);
                    else setBuyingCoin(token);
                    setIsModalOpen(false);
                }}
                type={modalType}
            />
    
    <div className="trade-crypto-container">
    <h2>Swap with SolPulse</h2>
    <p>Connect your wallet and trade your favorite cryptocurrencies.</p>

    <div className="swap-section">
        
        {/* 🔹 Sell Token Section */}
        <div className="swap-box">
            <label>You're Selling</label>

            <div className="coin-input-wrapper">
                {/* Select Token Button */}
                <button
                    className="coin-select-button"
                    onClick={() => {
                        console.log("🟢 Opening TokenModal for: sell");
                        console.log("🔍 Wallet Tokens Passed to Modal:", walletTokens);
                        setModalType("sell");
                        setIsModalOpen(true);
                    }}
                >
                    {selectedCoin ? (
                        <>
                            {selectedCoin.logoURI && (
                                <img
                                    src={selectedCoin.logoURI}
                                    alt={selectedCoin.symbol}
                                    className="coin-logo"
                                />
                            )}
                            {selectedCoin.symbol} ▼
                        </>
                    ) : "Select Coin ▼"}
                </button>

                {/* Sell Amount Input */}
                <input 
                    type="text" 
                    placeholder="0.00" 
                    value={sellAmount || computedSellAmount}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*\.?\d*$/.test(value) || value === "") {
                            setSellAmount(value);
                        }
                    }} 
                />
            </div>

            {/* 💰 Display Dollar Value */}
            {selectedCoin && (sellAmount || computedSellAmount) && (
                <p className="converted-price">
                    ${(
                        parseFloat(sellAmount || computedSellAmount) * (selectedCoin.price || 1)
                    ).toFixed(2)}
                </p>
            )}
        </div>

            {/* 🔹 Buy Token Section */}
            <div className="swap-box">
                <label>You're Buying</label>

                <div className="coin-input-wrapper">
                    {/* Select Token Button */}
                    <button
                        className="coin-select-button"
                        onClick={() => {
                            console.log("🟢 Opening TokenModal for: buy");
                            console.log("🔍 Wallet Tokens Passed to Modal:", walletTokens);
                            setModalType("buy");
                            setIsModalOpen(true);
                        }}
                    >
                        {buyingCoin ? (
                            <>
                                {buyingCoin.logoURI && (
                                    <img
                                        src={buyingCoin.logoURI}
                                        alt={buyingCoin.symbol}
                                        className="coin-logo"
                                    />
                                )}
                                {buyingCoin.symbol} ▼
                            </>
                        ) : "Select Coin ▼"}
                    </button>


                    {/* Buy Amount (Auto-filled) */}
                    <input
                        type="text"
                        placeholder="0.00"
                        value={computedBuyAmount}
                        readOnly
                    />
                </div>

                {/* 💰 Display Dollar Value */}
                {buyingCoin && computedBuyAmount && (
                    <p className="converted-price">
                        ${(
                            parseFloat(computedBuyAmount) * (buyingCoin.price || 1)
                        ).toFixed(2)}
                    </p>
                )}
            </div>

                {/* 🔄 Expected Output */}
                <div className="expected-output">
                    {loadingQuote ? (
                        <p>Loading quote...</p>
                    ) : (
                        <p>
                            Expected Output: {computedBuyAmount} {buyingCoin?.symbol || ""}
                        </p>
                    )}
                </div>

                {/* 🚀 Swap Button */}
                <button 
                    className="swap-button" 
                    onClick={executeSwap} 
                    disabled={isSwapping || !quote}
                >
                    {isSwapping ? "Swapping..." : "Swap"}
                </button>
            </div>

            {/* 🦊 Wallet Connection */}
            <CryptoWallet walletConnected={walletConnected} />
        </div>

                </>
            );
    };    
        

export default Trade;