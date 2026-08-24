export interface Branch {
  id: number;
  name: string;
  cityId: number;
  cityName?: string;
  address?: string;
  contactInfo?: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  isSortingCenter?: boolean;
  color?: string;
  createdAt: string;
}

export interface CreateBranchRequest {
  name: string;
  cityId?: number;
  cityName?: string;
  province?: string;
  district?: string;
  postalCode?: string;
  address?: string;
  contactInfo?: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  isSortingCenter?: boolean;
  color?: string;
}

export interface UpdateBranchRequest {
  name: string;
  cityId?: number;
  cityName?: string;
  province?: string;
  district?: string;
  postalCode?: string;
  address?: string;
  contactInfo?: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  isSortingCenter?: boolean;
  color?: string;
}
