import { create } from 'zustand';

interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    roles: string[];
}

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    setAuth: (token: string, user: User) => void;
    logout: () => void;
    initialize: () => void;
}

const getInitialAuth = () => {
    try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (token && userStr) {
            return {
                token,
                user: JSON.parse(userStr),
                isAuthenticated: true
            };
        }
    } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
    return { token: null, user: null, isAuthenticated: false };
};

const initialAuth = getInitialAuth();

export const useAuth = create<AuthState>((set) => ({
    ...initialAuth,

    setAuth: (token, user) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ token, user, isAuthenticated: true });
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ token: null, user: null, isAuthenticated: false });
    },

    initialize: () => {
        // Ya no es estrictamente necesario llamar esto en App.tsx pero lo dejamos por compatibilidad
        const current = getInitialAuth();
        set(current);
    },
}));

