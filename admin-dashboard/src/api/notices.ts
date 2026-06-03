import { api } from './client'; // Ajuste le chemin selon ton projet

// Les 4 statuts autorisés
export type NoticeStatus = 'PENDING' | 'LOADING' | 'RESOLVED' | 'CLOSED';

export interface NoticeItem {
  id_notice: number;
  title: string;
  content: string;
  status: NoticeStatus;
  created_at: string;
  is_public: boolean;
  author_pseudo: string;
  object_profile_title: string | null;
  object_title: string | null;
  tag_name: string;
}

export interface GetNoticesResponse {
  status: 'OK' | 'KO';
  message: string;
  code: number;
  data: NoticeItem[];
}

export interface UpdateStatusPayload {
  id_notice: number;
  status: NoticeStatus;
}

export interface UpdateStatusResponse {
  status: 'OK' | 'KO';
  message: string;
}

/**
 * Récupère l'ensemble des remarques/notices
 */
export const getAllNoticesApi = async (): Promise<GetNoticesResponse> => {
  const response = await api.get<GetNoticesResponse>('/notice/all');
  return response.data;
};

/**
 * Met à jour le statut d'une remarque spécifique
 */
export const updateNoticeStatusApi = async (payload: UpdateStatusPayload): Promise<UpdateStatusResponse> => {
  const response = await api.post<UpdateStatusResponse>('/notice/update_status', payload);
  return response.data;
};