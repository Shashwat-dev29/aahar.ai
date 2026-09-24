import axios from 'axios';

const BASE_URL = 'https://aahar-ai-xs0e.onrender.com';

// Create a custom Axios instance
const api = axios.create({
    baseURL: BASE_URL,
    // CRITICAL: This allows Axios to send the httpOnly refresh cookie automatically
    withCredentials: true 
});

// REQUEST INTERCEPTOR: Attach the Access Token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR: Catch 401s and refresh the token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If the error is 401 (Unauthorized) and we haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Ask backend for a new access token
                // (The httpOnly cookie is sent automatically because of withCredentials)
                const refreshResponse = await axios.get(`${BASE_URL}/api/auth/refresh`, {
                    withCredentials: true
                });

                const newAccessToken = refreshResponse.data.accessToken;
                
                // Save the new token
                localStorage.setItem('accessToken', newAccessToken);

                // Update the failed request's header with the new token
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                // Retry the original request
                return api(originalRequest);
                
            } catch (refreshError) {
                // If the refresh token itself is expired or invalid, force logout
                console.error("Session expired. Please log in again.");
                localStorage.clear();
                window.location.href = '/login'; // Redirect to login page
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
