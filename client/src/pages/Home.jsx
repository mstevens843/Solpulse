import React, { useContext } from "react";
import Feed from "@/components/Post_components/Feed";
import Explore from "@/components/Explore";
import CryptoTicker from "@/components/Crypto_components/CryptoTicker";
import { AuthContext } from "@/context/AuthContext";
import "@/css/pages/Home.css";

function Home() {
    const { user } = useContext(AuthContext);  // Get user from context

    return (
        <div className="home-page-container">
            <aside className="home-left">
                <CryptoTicker />
            </aside>

            <main className="home-middle">
                <Feed currentUser={user} />
            </main>

            <aside className="home-right">
                <Explore />
            </aside>
        </div>
    );
}

export default Home;
