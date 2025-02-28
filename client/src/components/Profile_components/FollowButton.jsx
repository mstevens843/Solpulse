import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { api } from "@/api/apiConfig";
import Loader from "@/components/Loader";
import "@/css/components/Profile_components/FollowButton.css"; 
import { FaUserPlus, FaUserCheck } from "react-icons/fa";


const FollowButton = ({ userId, updateCounts }) => {
    const [isFollowing, setIsFollowing] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const fetchFollowStatus = useCallback(async () => {
        try {
            const response = await api.get(`/users/${userId}/is-following`);
            setIsFollowing(response.data.isFollowing);
        } catch (error) {
            console.error("Error fetching follow status:", error);
            setErrorMessage("Failed to load follow status.");
        }
    }, [userId]);

    useEffect(() => {
        fetchFollowStatus();
    }, [fetchFollowStatus]);

    const handleFollowToggle = async () => {
        if (loading) return;

        setLoading(true);
        try {
            if (isFollowing) {
                await api.delete(`/users/${userId}/unfollow`);
                updateCounts(-1);
            } else {
                await api.post(`/users/${userId}/follow`);
                updateCounts(1);
            }
            setIsFollowing(!isFollowing);
        } catch (error) {
            console.error("Error updating follow status:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="follow-button-container">
            <button
            className={`follow-btn ${isFollowing ? "following" : ""}`}
            onClick={handleFollowToggle}
            disabled={loading}
            aria-label={isFollowing ? "Unfollow user" : "Follow user"}
        >
            {isFollowing ? <FaUserCheck /> : <FaUserPlus />}
            {isFollowing ? " Following" : " Follow"}
        </button>
            {errorMessage && <p className="follow-error">{errorMessage}</p>}
        </div>
    );
};


FollowButton.propTypes = {
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    updateCounts: PropTypes.func.isRequired,
};

export default FollowButton;