import api from "./api";
import type { City, CreateCityRequest, UpdateCityRequest } from "../types/city";

export const cityService = {
  getCities: async (activeOnly?: boolean): Promise<City[]> => {
    const response = await api.get<City[]>("/api/cities", {
      params: { activeOnly },
    });
    return response.data;
  },

  getCityById: async (id: number): Promise<City> => {
    const response = await api.get<City>(`/api/cities/${id}`);
    return response.data;
  },

  createCity: async (data: CreateCityRequest): Promise<City> => {
    const response = await api.post<City>("/api/cities", data);
    return response.data;
  },

  updateCity: async (id: number, data: UpdateCityRequest): Promise<City> => {
    const response = await api.put<City>(`/api/cities/${id}`, data);
    return response.data;
  },

  deleteCity: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/api/cities/${id}`);
    return response.data;
  },
};

export default cityService;
