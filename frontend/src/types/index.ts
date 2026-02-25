export interface User {
  userId: number;
  email: string;
  role: string;
   firstName: string;
  accessToken: string;
  refreshToken: string;
}

export interface Restaurant {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  cuisineType: string;
  rating: number;
  active: boolean;
  ownerId: number;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  restaurantId: number;
}

export interface CartItem {
  menuItemId: number;
  itemName: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: number;
  customerId: number;
  restaurantId: number;
  restaurantName: string;
  deliveryAddress: string;
  status: string;
  subtotal: number;
  deliveryFee: number;
  specialInstructions: string;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
}

export interface OrderItem {
  id: number;
  menuItemId: number;
  itemName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Payment {
  id: number;
  orderId: number;
  customerId: number;
  amount: number;
  paymentMethod: string;
  status: string;
  transactionReference: string;
}