import { api } from "./apiConfig";
export const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("Token is missing. User is not authenticated.");
    }

    const retryFetch = async (retries = 3) => {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await api.get("/users/me");
                return response;
            } catch (error) {
                if (i === retries - 1) throw error; // Throw error after final attempt
            }
        }
    };

    try {
        const response = await retryFetch();

        if (response.status !== 200) {
            console.error("Unexpected response status:", response.status);
            throw new Error("Failed to fetch user data. Unexpected response.");
        }

        if (!response?.data?.user) {
            console.warn("User data is missing in the response:", response?.data);
            throw new Error("User data not found in response.");
        }

        return response.data.user; // Return the user object.
    } catch (error) {
        if (error.response) {
            console.error("Server error fetching user data:", error.response.data || error.message);
        } else if (error.request) {
            console.error("No response received from server while fetching user data:", error.request);
        } else {
            console.error("Unexpected error fetching user data:", error.message);
        }

        throw error; // Re-throw the error to allow calling functions to handle it.
    }
};

