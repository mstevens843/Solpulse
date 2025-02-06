import React, { useEffect } from "react";

const JupiterSwap = () => {
  useEffect(() => {
    // Inject Jupiter Terminal script
    const script = document.createElement("script");
    script.src = "https://terminal.jup.ag/main-v3.js";
    script.async = true;
    script.setAttribute("data-preload", "");
    document.body.appendChild(script);

    script.onload = () => {
      console.log("🪐 Jupiter Terminal loaded successfully.");
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const launchJupiterTerminal = () => {
    const targetContainer = document.getElementById("jupiter-terminal-container");
  
    if (window.Jupiter && targetContainer) {
      window.Jupiter.init({
        displayMode: "integrated",
        integratedTargetId: "jupiter-terminal-container",
        endpoint: "https://api.mainnet-beta.solana.com",
        containerClassName: "jupiter-container",
        formProps: {
          fixedInputMint: false,
          fixedOutputMint: false,
          swapMode: "ExactIn",
          fixedAmount: false,
          initialSlippageBps: 50,
        },
        onSuccess: ({ txid, swapResult }) => {
          console.log("✅ Swap Successful:", txid, swapResult);
          alert(`Swap Successful! Check Explorer: https://explorer.solana.com/tx/${txid}?cluster=mainnet-beta`);
        },
        onSwapError: ({ error }) => {
          console.error("🚨 Swap Error:", error);
          alert("Swap Failed. Please try again.");
        },
      });
    } else {
      console.error("❌ Jupiter Terminal or Target Container not found.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-4">Jupiter Swap Terminal</h1>
      <p className="mb-6 text-center text-gray-400">
        Experience seamless token swaps powered by Jupiter. Connect your wallet and start swapping instantly.
      </p>
      <button
        onClick={launchJupiterTerminal}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white font-semibold shadow-md"
      >
        🚀 Launch Swap Terminal
      </button>

      <div id="jupiter-terminal-container" className="w-full max-w-2xl mt-8"></div>
    </div>
  );
};

export default JupiterSwap;