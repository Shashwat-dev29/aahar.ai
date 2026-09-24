import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // 1. Better approach: Check localStorage immediately during initial state setup
    // This prevents a split-second render where user is null before useEffect runs
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('accessToken'); // MATCHES LOGIN KEY
        const role = localStorage.getItem('role');
        const email = localStorage.getItem('email');
        
        if (token && role) {
            return { token, role, email };
        }
        return null;
    });

    const navigate = useNavigate();

    // 2. We can remove the useEffect entirely because we initialized the state above!

    const login = (userData) => {
        // Save using 'accessToken'
        localStorage.setItem('accessToken', userData.accessToken); 
        localStorage.setItem('role', userData.role);
        localStorage.setItem('email', userData.email);
        
        setUser({ 
            token: userData.accessToken, 
            role: userData.role, 
            email: userData.email 
        });
        
        navigate(`/${userData.role}`);
    };

    const logout = async () => {
        try {
            await api.post('/api/auth/logout');
        } catch(err) {
            console.error("logout failed", err);
        } finally {
            localStorage.clear(); // This safely wipes accessToken, role, and email
            setUser(null);
            navigate('/login');
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};