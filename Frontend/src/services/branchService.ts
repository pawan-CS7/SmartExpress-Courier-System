import api from "./api";
import type { Branch, CreateBranchRequest, UpdateBranchRequest } from "../types/branch";

export const branchService = {
  getBranches: async (cityId?: number, activeOnly?: boolean): Promise<Branch[]> => {
    const response = await api.get<Branch[]>("/api/branches", {
      params: { cityId, activeOnly },
    });
    return response.data;
  },

  getBranchById: async (id: number): Promise<Branch> => {
    const response = await api.get<Branch>(`/api/branches/${id}`);
    return response.data;
  },

  createBranch: async (data: CreateBranchRequest): Promise<Branch> => {
    const response = await api.post<Branch>("/api/branches", data);
    return response.data;
  },

  updateBranch: async (id: number, data: UpdateBranchRequest): Promise<Branch> => {
    const response = await api.put<Branch>(`/api/branches/${id}`, data);
    return response.data;
  },

  deleteBranch: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/api/branches/${id}`);
    return response.data;
  },
};

export default branchService;
