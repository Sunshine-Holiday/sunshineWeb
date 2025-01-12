import { AuthState, CredentialsPayload } from "@/types/auth";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Function to store token in localStorage
export const storeToken = (token: string): void => {
    try {
        localStorage.setItem("token", token);
    } catch (error) {
        console.error("Error storing token:", error);
        throw error; // Re-throw the error to handle elsewhere if needed
    }
};

// Function to remove token from localStorage
const removeToken = (): void => {
    try {
        localStorage.removeItem("token");
    } catch (error) {
        console.error("Error removing token:", error);
        throw error; // Re-throw the error to handle elsewhere if needed
    }
};

// Function to get token from localStorage
export const getToken = (): string | null => {
    try {
        return localStorage.getItem("token");
    } catch (error) {
        console.error("Error retrieving token:", error);
        return null;
    }
};

// Initial state for the auth slice, dynamically setting token and loading state
const initialState: AuthState = {
    token: getToken(),
    message: null,
    user: null,
    isLoading: true, // Set loading to true if token exists
    isAuthenticated: false, // Set true if token exists
};

// Redux slice for auth management
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<CredentialsPayload>) => {
            const { token, message, user } = action.payload;
            state.token = token || null;
            state.user = user;
            state.message = message || "";
            state.isAuthenticated = true;
            state.isLoading = false;

            // Store token in localStorage
            try {
                if (token) storeToken(token);
            } catch (error) {
                console.error("Failed to store token:", error);
            }
        },
        logout: (state) => {
            state.token = null;
            state.message = "Logged out successfully";
            state.isAuthenticated = false;
            state.isLoading = false;
            state.user = null; // Ensure user data is cleared
            try {
                removeToken(); // Remove token from localStorage
            } catch (error) {
                console.error("Failed to remove token:", error);
            }
        },
        authError: (state) => {
            state.token = null;
            state.user = null;
            state.message = "Error occurred while authentication";
            state.isAuthenticated = false;
            state.isLoading = false;
        },
        clearError: (state) => {
            state.message = null; // Only reset the message field
        },
    },
});

// Export actions and selectors
export const { setCredentials, logout, authError, clearError } = authSlice.actions;
export const selectCurrentMessage = (state: { auth: AuthState }) => state.auth.message;
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectCurrentToken = (state: { auth: AuthState }) => state.auth.token;
export const selectCurrentLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectCurrentIsAuth = (state: { auth: AuthState }) => state.auth.isAuthenticated;

export default authSlice.reducer;