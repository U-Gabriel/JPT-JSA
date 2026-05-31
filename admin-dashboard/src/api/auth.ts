import axios from 'axios';
import type { ApiResponse, UserData } from '../types/auth';

const API_URL = 'http://51.77.141.175:3000';

export const loginApi = async (pseudo: string, password: string): Promise<ApiResponse<UserData>> => {
  try {
    const response = await axios.post(`${API_URL}/login_app`, {
      pseudo,
      password,
    });
    return response.data;
  } catch (error: any) {
    // Si l'API renvoie un code 401, axios lève une erreur, on récupère la réponse personnalisée
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