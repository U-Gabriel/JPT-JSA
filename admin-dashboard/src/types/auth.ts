// 1. La constante de référence (runtime)
export const USER_ROLES = {
  BANNED: 1,
  ADMIN_SIMPLE: 2,
  SUPER_ADMIN: 3,
  MANAGER: 4,
  PREPARATOR: 5,
  ACCOUNTANT: 6,
  ENGINEER: 7,
} as const;

// 2. Le type TypeScript extrait de la constante
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export interface UserData {
  id_person: number;
  pseudo: string;
  mail: string;
  firstname: string;
  surname: string;
  id_role: UserRole; // Utilise le type (1 | 2 | 3)
  is_verified: boolean;
  token: string;
}

export interface ApiResponse<T> {
  status: 'OK' | 'KO';
  message: string | null;
  code: number;
  data: T | null;
}