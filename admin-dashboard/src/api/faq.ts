import { api } from './client';
import type { ApiResponse } from './tag';

export interface ObjectLookupItem {
  id_object: number;
  title: string;
}

export interface FaqItem {
  id_faq: number;
  question: string;
  answer: string;
  order_view: number;
  object_title: string | null;
  tag_title: string | null;
}

export interface CreateFaqPayload {
  question: string;
  answer: string;
  id_tag: number;
  id_object: number | null; // Nullable si la FAQ est globale (ex: entreprise, divers)
  order_view: number;
}

/**
 * Récupère toutes les entrées de la FAQ
 */
export const getAllFaqsApi = async (): Promise<ApiResponse<FaqItem[]>> => {
  const response = await api.get<ApiResponse<FaqItem[]>>('/faqs/all');
  return response.data;
};

/**
 * Récupère la liste simplifiée des objets pour le select
 */
export const getObjectsLookupApi = async (): Promise<ApiResponse<ObjectLookupItem[]>> => {
  const response = await api.get<ApiResponse<ObjectLookupItem[]>>('/objects/lookup');
  return response.data;
};

/**
 * Crée une nouvelle question/réponse dans la FAQ
 */
export const createFaqApi = async (payload: CreateFaqPayload): Promise<ApiResponse<Partial<FaqItem>>> => {
  const response = await api.post<ApiResponse<Partial<FaqItem>>>('/faq/create', payload);
  return response.data;
};

/**
 * Supprime une FAQ par son ID
 */
export const deleteFaqApi = async (id_faq: number): Promise<ApiResponse<string>> => {
  const response = await api.post<ApiResponse<string>>('/faq/delete', { id_faq });
  return response.data;
};