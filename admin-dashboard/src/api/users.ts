import { api } from './client';
import type { ApiResponse } from '../types/auth';

export interface CreateUserData {
  pseudo: string;
  mail: string;
  password?: string;
  firstname: string | null;
  surname: string | null;
  number_phone?: string;
  id_role: number;
  is_verified: boolean;
}

// 🟢 Interface pour le modèle de données "Person" renvoyé par l'API
export interface PersonData {
  id_person: number;
  pseudo: string;
  mail: string;
  firstname: string | null;
  surname: string | null;
  id_role: number;
  is_verified: boolean;
}

export const createUserApi = async (userData: CreateUserData): Promise<ApiResponse<{ mail: string; pseudo: string }>> => {
  try {
    const response = await api.post<ApiResponse<{ mail: string; pseudo: string }>>('/register', userData);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) return error.response.data;
    return { status: 'KO', message: 'Erreur serveur lors de la création.', code: 500, data: null };
  }
};

// 🟢 1. RECHERCHE / LISTE DES UTILISATEURS
export const searchPersonsApi = async (searchText: string): Promise<ApiResponse<PersonData[]>> => {
  try {
    const response = await api.post<ApiResponse<PersonData[]>>('/persons/search', { searchText });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) return error.response.data;
    return { status: 'KO', message: 'Impossible de récupérer la liste.', code: 500, data: null };
  }
};

// 🟢 2. SUPPRESSION D'UN UTILISATEUR
export const deletePersonApi = async (idPersonToDelete: number): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await api.post<ApiResponse<{ message: string }>>('/persons/delete', {
      id_person_to_delete: idPersonToDelete
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) return error.response.data;
    return { status: 'KO', message: 'Erreur lors de la suppression.', code: 500, data: null };
  }
};