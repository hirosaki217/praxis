export type ID = string;
export type Money = number;
export type ISODate = string;

export type Channel = 'delivery' | 'pickup' | 'dine-in';
export type Size = 'S' | 'M' | 'L' | 'XL';
export type CrustType = 'thin' | 'thick' | 'cheese';

export type OrderStatus =
    | 'created' | 'confirmed' | 'preparing'
    | 'ready' | 'ready_for_pickup' | 'assigned_driver'
    | 'out_for_delivery' | 'served' | 'delivered' | 'picked_up'
    | 'completed' | 'cancelled' | 'refunded'

export type PaymentMethod = 'cod' | 'momo' | 'card' | 'zalopay'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Paginated<T> {
    items: T[]
    total: number
    page: number
    pageSize: number
}