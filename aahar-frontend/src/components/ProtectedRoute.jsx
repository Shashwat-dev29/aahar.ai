import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // Adjust path if needed

export default function ProtectedRoute({ children }) {
    const { user } = useContext(AuthContext);

    // If there is no user logged in, kick them back to the login page
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If user exists, allow them to view the page (like NgoPage)
    return children;
}