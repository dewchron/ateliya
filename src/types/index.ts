export type ServiceType = string;

export interface EditItem {
  id: number;
  title: string;
  subtitle: string;
  image: any; // require() returns number
  desc: string;
}

export interface CartItem {
  serviceId: ServiceType;
  serviceName: string;
  price: number;
  quantity: number;
}

export interface BookingState {
  selectedServices: ServiceType[];
  cart: CartItem[];
  selectedDate: string;
  selectedTime: string;
  selectedCommunityId: string;
  selectedCommunityName: string;
  customCommunity: string;
  paymentId: string;
  editingOrderId: string;
}

export type BookingAction =
  | { type: 'TOGGLE_SERVICE'; service: ServiceType }
  | { type: 'SET_CART_QTY'; serviceId: ServiceType; serviceName: string; price: number; quantity: number }
  | { type: 'ADD_TO_CART' }
  | { type: 'REMOVE_FROM_CART'; serviceId: ServiceType }
  | { type: 'SELECT_DATE'; date: string }
  | { type: 'SELECT_TIME'; time: string }
  | { type: 'SELECT_COMMUNITY'; communityId: string; communityName: string; date: string; time: string }
  | { type: 'SET_CUSTOM_COMMUNITY'; name: string }
  | { type: 'SET_PAYMENT'; paymentId: string }
  | { type: 'SET_EDITING_ORDER'; orderId: string }
  | { type: 'RESET' };
