import React, { useState, useEffect, useCallback } from "react";
import { api } from "@/api/apiConfig";
import CryptoWalletIntegration from "@/components/CryptoWalletIntegration";
import CryptoTransactions from "@/components/CryptoTransactions";
import Feed from "@/components/Feed";
import MessagePreview from "@/components/MessagePreview";
import "@/css/pages/Dashboard.css";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedError, setFeedError] = useState(false);


  const fetchUserData = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const userResponse = await api.get("/users/me");
      setUser(userResponse.data || {});
      
      const transactionsResponse = await api.get("/transactions");
      setTransactions(transactionsResponse.data.transactions);

      const messagesResponse = await api.get("/messages/recent");
      setUnreadMessages(messagesResponse.data.messages.filter((msg) => !msg.read).length);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      // setError("Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const calculatePortfolioValue = () =>
    transactions.reduce((acc, txn) => acc + txn.amount, 0).toFixed(2);

  const renderTransactionBox = () => {
    if (transactions.length === 0) return null;

    const latestTransaction = transactions[0];
    return (
      <div className="transaction-box">
        <h3>Latest Transaction</h3>
        <p>Type: {latestTransaction.type || "Unknown"}</p>
        <p>Amount: {latestTransaction.amount || "0.00"} SOL</p>
        <p>Date: {latestTransaction.date || "Invalid Date"}</p>
      </div>
    );
  };

  const loadFeed = async () => {
    try {
      await api.get("/feed");
    } catch (err) {
      console.error("Error fetching feed:", err);
      setFeedError(true);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome, {user?.username || "User"}!</h1>
      </header>
  
      {error && <p className="dashboard-error">{error}</p>}
  
      {isLoading ? (
        <p className="dashboard-loading">Loading dashboard...</p>
      ) : (
        <>
          {/* User Notifications Section */}
          <section>
            <h2 className="dashboard-section-title">User Notifications</h2>
            <div className="dashboard-scorecards">
              <div
                className="scorecard clickable"
                onClick={() => (window.location.href = "/notifications")}
              >
                <h3>Unread Messages</h3>
                <p>{unreadMessages}</p>
              </div>
              <div
                className="scorecard clickable"
                onClick={() => console.log("Redirect to Followers page or modal")}
              >
                <h3>New Followers</h3>
                <p>{user?.newFollowers || 0}</p>
              </div>
              <div
                className="scorecard clickable"
                onClick={() => console.log("Redirect to Likes notifications")}
              >
                <h3>New Likes</h3>
                <p>{user?.newLikes || 0}</p>
              </div>
              <div
                className="scorecard clickable"
                onClick={() => console.log("Redirect to Tips page or modal")}
              >
                <h3>New Tips</h3>
                <p>{user?.newTips || 0}</p>
              </div>
            </div>
          </section>
  
          {/* Crypto Analytics Section */}
          <section>
            <h2 className="dashboard-section-title">Crypto Analytics</h2>
            <div className="dashboard-scorecards">
              <div className="scorecard">
                <h3>Total Portfolio</h3>
                <p>${calculatePortfolioValue()}</p>
              </div>
              <div className="scorecard">
                <h3>Transactions Today</h3>
                <p>{transactions.length}</p>
              </div>
              <div className="scorecard">
                <h3>Biggest Gainer</h3>
                <p>{user?.biggestGainer || "N/A"}</p>
              </div>
              <div className="scorecard">
                <h3>Biggest Loser</h3>
                <p>{user?.biggestLoser || "N/A"}</p>
              </div>
            </div>
          </section>
  
      
  
         {/* Feed and Messages */}
         <div className="dashboard-main">
            <div className={`dashboard-feed ${transactions.length > 0 ? "expanded" : ""}`}>
              <h2>Your Feed</h2>
              {feedError ? (
                <p className="dashboard-error">Failed to load feed, please try again.</p>
              ) : (
                !isLoading && user && <Feed currentUser={user} />
              )}
            </div>
            <section className="dashboard-messages">
              <h2>Recent Messages</h2>
              <MessagePreview />
            </section>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;