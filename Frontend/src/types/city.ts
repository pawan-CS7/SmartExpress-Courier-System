export interface City {
  id: number;
  name: string;
  province?: string;
  postalCode?: string;
  district?: string;
  isActive: boolean;
  branchCount: number;
  createdAt: string;
}

export interface CreateCityRequest {
  name: string;
  province?: string;
  postalCode?: string;
  district?: string;
  isActive: boolean;
}

export interface UpdateCityRequest {
  name: string;
  province?: string;
  postalCode?: string;
  district?: string;
  isActive: boolean;
}

