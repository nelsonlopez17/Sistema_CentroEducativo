import api from "./axios";


export const login = async (username: string, password: string) => {
    try {
        const response = await api.post('api/login/', {
            username,
            password
        });
        return response.data;
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};

export default login;