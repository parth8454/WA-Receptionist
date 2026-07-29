import { createContext, useContext, useState, useEffect } from 'react';
import { loginShop, registerShop } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Restore session on page refresh
        const savedShop = localStorage.getItem('shop');
        const token = localStorage.getItem('token');
        if (savedShop && token) {
            setShop(JSON.parse(savedShop));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
    const res = await loginShop({ email, password });
    const { token, shop } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('shop', JSON.stringify(shop));
    setShop(shop);
    return shop;
};

    const register = async (businessName, email, password, inviteCode) => {
        const res = await registerShop({ businessName, email, password, inviteCode });
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('shop');
        setShop(null);
    };

    return (
        <AuthContext.Provider value={{ shop, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);