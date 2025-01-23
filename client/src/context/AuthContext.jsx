import React, { createContext, useState, useEffect } from "react";
import { api } from "@/api/apiConfig"; // Axios instance

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            const storedUser = localStorage.getItem("user");

            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error("Error parsing stored user data:", error);
                    localStorage.removeItem("user"); // Remove corrupted data
                } finally {
                    setLoading(false);
                }
            } else {
                const fetchUser = async () => {
                    try {
                        const response = await api.get("/auth/me");
                        const userData = response.data;
                        setUser(userData);
                        localStorage.setItem("user", JSON.stringify(userData));
                        setIsAuthenticated(true);
                    } catch (error) {
                        console.error("Error fetching user data:", error);
                        localStorage.removeItem("token");
                        setIsAuthenticated(false);
                    } finally {
                        setLoading(false);
                    }
                };

                fetchUser();
            }
        } else {
            setLoading(false);
            setIsAuthenticated(false);
        }
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, setUser, isAuthenticated, setIsAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};