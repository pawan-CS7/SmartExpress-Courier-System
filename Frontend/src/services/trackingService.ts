import api from './api';

export interface TrackingHistory {
    id: number;
    status: string;
    location?: string;
    remarks: string;
    updatedAt: string;
    updatedBy: string;
}

export interface OrderTracking {
    orderId: number;
    waybillId: string;
    orderNo: string;
    customerName: string;
    status: string;
    createdAt: string;
    completedAt: string;
    history: TrackingHistory[];
}

export const getTrackingInfo = async (trackingNo: string): Promise<OrderTracking> => {
    const response = await api.get(`/api/tracking/${trackingNo}`);
    return response.data;
};

export const updateTrackingStatus = async (orderId: number, status: string, location: string, remarks: string) => {
    const response = await api.post(`/api/tracking/${orderId}`, { status, location, remarks });
    return response.data;
};
