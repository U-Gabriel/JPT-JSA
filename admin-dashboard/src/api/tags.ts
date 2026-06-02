import { api } from './client';

export interface Tag {
  id_tag: number;
  title: string;
  color_code: string;
  description: string;
}

interface ApiResponse<T> {
  status: 'OK' | 'KO';
  message: string | null;
  code: number;
  data: T;
}

// Récupérer la liste de tous les tags disponibles
export const getTagsApi = async (): Promise<ApiResponse<Tag[]>> => {
  try {
    const response = await api.get<ApiResponse<Tag[]>>('/tags');
    return response.data;
  } catch (error: any) {
    return {
      status: 'KO',
      message: error.response?.data?.message || 'Impossible de charger les tags.',
      code: error.response?.status || 500,
      data: [],
    };
  }
};