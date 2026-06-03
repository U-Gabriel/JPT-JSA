import { api } from './client'; // Ajuste le chemin selon ton projet

export interface PlantDataPayload {
  title: string;
  description: string;
  height_max: number;
  weight_max: number;
  advise: string;
  category: string;
  scientist_name: string;
  family_name: string;
  type_name: string;
  exposition_type: string;
  ground_type: string;
  saison_first: string;
  saison_second: string;
  saison_third: string;
  saison_last: string;
  number_good_saison: number;
  plantation_saison: string;
  humidity_ground: number;
  temperature_sensor_ground: number;
  exposition_time_sun: number;
}

export interface GroupDataPayload {
  title: string;
  description: string;
  conductivity_elec: number;
  temp_ground: number;
  temp_extern: number;
  humidity_air: number;
  humidity_ground: number;
  uv_time: number;
  watering_time: number;
  priority: number;
  last_watering: string; // Format YYYY-MM-DD ou ISO string
  watering_period: number;
}

export interface ApiResponse {
  status: 'OK' | 'KO';
  message: string;
}

export interface AvatarItem {
  id_avatar: number;
  title: string;
  description: string;
  picture_path: string;
  evolution_number: number | null;
  state: number;
}

export interface GroupInfo {
  id_group_plant_type: number | null;
  title: string | null;
  description: string | null;
  conductivity_electrique_fertility_sensor: number | null;
  temperature_sensor_ground: number | null;
  temperature_sensor_extern: number | null;
  humidity_air_sensor: number | null;
  humidity_ground_sensor: number | null;
  exposition_time_uv: number | null;
  is_active: boolean | null;
  is_standard: boolean | null;
  watering_time: number | null;
  prority_plant: number | null;
  last_date_arrosage: string | null;
  watering_period_open: number | null;
}

export interface PlantItem {
  id_plant_type: number;
  title: string;
  description: string;
  advise: string;
  category: string;
  scientist_name: string;
  family_name: string;
  type_name: string;
  exposition_type: string;
  ground_type: string;
  saison_first: string | null;
  saison_second: string | null;
  saison_third: string | null;
  saison_last: string | null;
  number_good_saison: number | null;
  plantation_saison: string;
  humidity_ground: string | null;
  ph_ground_sensor: string | null;
  conductivity_electrique_fertility_sensor: string | null;
  temperature_sensor_ground: string | null;
  temperature_sensor_extern: string | null;
  exposition_time_sun: string | null;
  height_max: string | null;
  weight_max: string | null;
  group_info: GroupInfo;
  avatars: AvatarItem[];
}

export interface GetPlantsResponse {
  status: 'OK' | 'KO';
  data: PlantItem[];
}

/**
 * Envoie les données de création d'une plante au serveur (Multipart/Form-Data)
 */
export const createPlantApi = async (
  plantData: PlantDataPayload,
  groupData: GroupDataPayload,
  images: File[]
): Promise<ApiResponse> => {
  const formData = new FormData();

  // On convertit les objets complexes en chaînes JSON comme attendu par ton JSON.parse() au backend
  formData.append('plantData', JSON.stringify(plantData));
  formData.append('groupData', JSON.stringify(groupData));

  // Ajout des fichiers d'images dans la clé 'images' (doit correspondre à uploadPlant.array('images', 10))
  images.forEach((file) => {
    formData.append('images', file);
  });

  const response = await api.post<ApiResponse>('/plants/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * Récupère toutes les plantes avec leurs configurations cibles et avatars
 */
export const getAllPlantsApi = async (): Promise<GetPlantsResponse> => {
  const response = await api.get<GetPlantsResponse>('/plants/all');
  return response.data;
};

/**
 * Supprime une espèce configurée via son ID
 */
export const deletePlantApi = async (id_plant_type: number): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>('/plants/delete', {
    id_plant_type: id_plant_type
  });
  return response.data;
};