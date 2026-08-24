import api from "./api";

export interface RiderDelivery {
  id: number;
  trackingNumber: string;
  senderAddress: string;
  senderPhone: string;
  destinationAddress: string;
  customerName: string;
  customerPhone: string;
  status: string;
  assignedAt: string;
  completedAt?: string;
}

export interface UpdateDeliveryStatus {
  status: string;
  location: string;
  remarks: string;
}

export const getPendingDeliveries = async (): Promise<RiderDelivery[]> => {
  const response = await api.get("/api/RiderApp/pending");
  return response.data;
};

export const getCompletedDeliveries = async (): Promise<RiderDelivery[]> => {
  const response = await api.get("/api/RiderApp/completed");
  return response.data;
};

export const getFailedDeliveries = async (): Promise<RiderDelivery[]> => {
  const response = await api.get("/api/RiderApp/failed");
  return response.data;
};

export const updateDeliveryStatus = async (trackingNumber: string, data: UpdateDeliveryStatus): Promise<void> => {
  await api.post(`/api/RiderApp/${trackingNumber}/status`, data);
};
