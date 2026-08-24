import api from './api';

export const getAdminDashboard = async () => {
    const response = await api.get('/api/Dashboard/admin');
    return response.data;
};

export const getClientDashboard = async () => {
    const response = await api.get('/api/Dashboard/client');
    return response.data;
};
