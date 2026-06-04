import { api } from './client'; // <--- IMPORTANT : On utilise notre client configuré
import type { ApiResponse, UserData } from '../types/auth';

export const loginApi = async (pseudo: string, password: string): Promise<ApiResponse<UserData>> => {
  try {
    // On utilise "api.post" à la place de "axios.post" et le baseURL est déjà inclus !
    const response = await api.post<ApiResponse<UserData>>('/login_app', {
      pseudo,
      password,
    });
    return response.data;
  } catch (error: any) {
    // Si l'API renvoie un code 401, on récupère ton format JSON { status: 'KO', message: ... }
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return {
      status: 'KO',
      message: 'Erreur de connexion au serveur.',
      code: 500,
      data: null,
    };
  }
};

// --- RÉCUPÉRATION DU PROFIL UTILISATEUR CONNECTÉ ---
export const getMeApi = async (): Promise<ApiResponse<any>> => {
  try {
    const response = await api.get<ApiResponse<any>>('/persons/me');
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return {
      status: 'KO',
      message: 'Impossible de charger le profil.',
      code: 500,
      data: null,
    };
  }
};