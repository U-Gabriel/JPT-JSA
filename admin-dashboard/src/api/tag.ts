import { api } from './client';

export interface TagItem {
  id_tag: number;
  title: string;
  color_code: string;
  description: string;
}

export interface CreateTagPayload {
  title: string;
  color_code: string;
  description: string;
}

export interface ApiResponse<T> {
  status: 'OK' | 'KO';
  message: string | null;
  code: number;
  data: T;
}

/**
 * Récupère tous les tags disponibles
 */
export const getAllTagsApi = async (): Promise<ApiResponse<TagItem[]>> => {
  const response = await api.get<ApiResponse<TagItem[]>>('/tags');
  return response.data;
};

/**
 * Crée un nouveau tag
 */
export const createTagApi = async (payload: CreateTagPayload): Promise<ApiResponse<TagItem>> => {
  const response = await api.post<ApiResponse<TagItem>>('/tag/create', payload);
  return response.data;
};

/**
 * Supprime un tag par son ID
 */
export const deleteTagApi = async (id_tag: number): Promise<ApiResponse<string>> => {
  const response = await api.post<ApiResponse<string>>('/tag/delete', { id_tag });
  return response.data;
};