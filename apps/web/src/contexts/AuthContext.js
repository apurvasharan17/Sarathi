import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAuthErrorHandler } from '../lib/api';
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [jwt, setJwt] = useState(localStorage.getItem('jwt'));
    const [sarathiId, setSarathiId] = useState(localStorage.getItem('sarathiId'));
    const navigate = useNavigate();
    const login = (newJwt, newSarathiId) => {
        localStorage.setItem('jwt', newJwt);
        localStorage.setItem('sarathiId', newSarathiId);
        setJwt(newJwt);
        setSarathiId(newSarathiId);
    };
    const logout = useCallback(() => {
        localStorage.removeItem('jwt');
        localStorage.removeItem('sarathiId');
        setJwt(null);
        setSarathiId(null);
        navigate('/login');
    }, [navigate]);
    // Set up automatic logout on auth errors (401)
    useEffect(() => {
        setAuthErrorHandler(() => {
            console.warn('Token expired or invalid - logging out');
            logout();
        });
    }, [logout]);
    const value = {
        isAuthenticated: !!jwt,
        jwt,
        sarathiId,
        login,
        logout,
    };
    return _jsx(AuthContext.Provider, { value: value, children: children });
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
//# sourceMappingURL=AuthContext.js.map