import { api } from './client';

export type OrderStatus = 'PAID' | 'LOADING' | 'SENDING' | 'CLOSED';

export interface OrderItem {
  id_order_item: number;
  quantity: number;
  unit_price: number;
  object_title: string;
  object_sku: string | null;
}

export interface OrderData {
  id_order: number;
  order_date: string;
  status: OrderStatus;
  total_price: string;
  payment_ref: string;
  customer_mail: string;
  firstname: string;
  surname: string;
  total_items: number;
  items: OrderItem[];
}

export interface OrderApiResponse<T> {
  status: 'OK' | 'KO';
  message: string | null;
  code: number;
  data: T;
}

export interface AddStockPayload {
  id_object: number;
  quantity_add: number;
}

export interface UpdateOrderStatusPayload {
  id_order: number;
  status: OrderStatus;
}

/**
 * Ajoute ou retire du stock pour un objet
 */
export const addStockApi = async (payload: AddStockPayload): Promise<OrderApiResponse<string>> => {
  const response = await api.post<OrderApiResponse<string>>('/objects/add-stock', payload);
  return response.data;
};

/**
 * Récupère les commandes filtrées par un statut spécifique
 */
export const getOrdersByStatusApi = async (status: OrderStatus): Promise<OrderApiResponse<OrderData[]>> => {
  const response = await api.post<OrderApiResponse<OrderData[]>>('/orders/list-by-status', { status });
  return response.data;
};

/**
 * Met à jour le statut d'une commande
 */
export const updateOrderStatusApi = async (payload: UpdateOrderStatusPayload): Promise<OrderApiResponse<string>> => {
  const response = await api.post<OrderApiResponse<string>>('/orders/update_status', payload);
  return response.data;
};