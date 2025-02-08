import React, { useState, useEffect } from "react";
import { api } from "@/api/apiConfig"; 
import UserCard from "@/components/Profile_components/UserCard"; 
import "@/css/components/Profile_components/FollowersFollowing.css"; 

function FollowersFollowing({ userId, type }) {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("")

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError("");
            try {
                let response;
                if (type === "followers") {
                    response = await api.get(`/users/${userId}/followers`);
                    setList(response.data.followers || []);
                } else {
                    response = await api.get(`/users/${userId}/following`);
                    setList(response.data.following || []);
                }
            } catch (err) {
                setError("Failed to fetch list.");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [userId, type]);

    return (
        <div>
            {error && <p>{error}</p>}
            {loading ? <p>Loading...</p> : (
                <>
                    {list.length === 0 ? (
                        <p>No {type} yet.</p>
                    ) : (
                        <ul>
                            {list.map((user) => (
                                <li key={user.id}>
                                    <UserCard user={user} />
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </div>
    );
}
export default FollowersFollowing;