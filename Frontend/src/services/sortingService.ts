import api from "./api";

export interface ScanResult {
  message: string;
  orderId: number;
  trackingNumber: string;
  status: string;
  destination?: string;
}

export const inboundScan = async (trackingNumber: string): Promise<ScanResult> => {
  const response = await api.post("/api/sorting/inbound", { trackingNumber });
  return response.data;
};

export const outboundScan = async (trackingNumber: string, targetBranchId: number): Promise<ScanResult> => {
  const response = await api.post("/api/sorting/outbound", { trackingNumber, targetBranchId });
  return response.data;
};
