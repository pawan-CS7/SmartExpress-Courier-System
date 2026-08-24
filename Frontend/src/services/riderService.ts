import api from "./api";

export interface Rider {
  id: number;
  riderId: string;
  name: string;
  phone: string;
  branchId: number;
  branchName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateRider {
  name: string;
  phone: string;
  email: string;
  password?: string;
  branchId: number;
}

export interface UpdateRider {
  name: string;
  phone: string;
  email: string;
  password?: string;
  branchId: number;
  isActive: boolean;
}

export const getRiders = async (): Promise<Rider[]> => {
  const response = await api.get("/api/Riders");
  return response.data;
};

export const createRider = async (data: CreateRider): Promise<Rider> => {
  const response = await api.post("/api/Riders", data);
  return response.data;
};

export const updateRider = async (id: number, data: UpdateRider): Promise<Rider> => {
  const response = await api.put(`/api/Riders/${id}`, data);
  return response.data;
};

export const deleteRider = async (id: number): Promise<void> => {
  await api.delete(`/api/Riders/${id}`);
};
