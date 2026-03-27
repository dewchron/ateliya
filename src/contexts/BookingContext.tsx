import React, { createContext, useContext, useReducer } from 'react';
import { BookingState, BookingAction, ServiceType } from '../types';

const initialState: BookingState = {
  selectedServices: [],
  cart: [],
  selectedDate: '',
  selectedTime: '',
  selectedCommunityId: '',
  selectedCommunityName: '',
  customCommunity: '',
  paymentId: '',
  editingOrderId: '',
};

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'TOGGLE_SERVICE': {
      const exists = state.selectedServices.includes(action.service);
      return {
        ...state,
        selectedServices: exists
          ? state.selectedServices.filter((s) => s !== action.service)
          : [...state.selectedServices, action.service],
      };
    }
    case 'SET_CART_QTY': {
      const cart = state.cart.filter((c) => c.serviceId !== action.serviceId);
      if (action.quantity > 0) cart.push({ serviceId: action.serviceId, serviceName: action.serviceName, price: action.price, quantity: action.quantity });
      return { ...state, cart };
    }
    case 'ADD_TO_CART': {
      const newItems = state.selectedServices.map((sid) => {
        const existing = state.cart.find((c) => c.serviceId === sid);
        return existing || { serviceId: sid, serviceName: sid, price: 0, quantity: 1 };
      });
      return { ...state, cart: newItems };
    }
    case 'REMOVE_FROM_CART': {
      const cart = state.cart.filter((c) => c.serviceId !== action.serviceId);
      return {
        ...state,
        cart,
        selectedServices: state.selectedServices.filter((s) => s !== action.serviceId),
      };
    }
    case 'SELECT_DATE':
      return { ...state, selectedDate: action.date };
    case 'SELECT_TIME':
      return { ...state, selectedTime: action.time };
    case 'SELECT_COMMUNITY':
      return {
        ...state,
        selectedCommunityId: action.communityId,
        selectedCommunityName: action.communityName,
        selectedDate: action.date,
        selectedTime: action.time,
        customCommunity: '',
      };
    case 'SET_CUSTOM_COMMUNITY':
      return { ...state, customCommunity: action.name, selectedCommunityId: '', selectedCommunityName: '' };
    case 'SET_PAYMENT':
      return { ...state, paymentId: action.paymentId };
    case 'SET_EDITING_ORDER':
      return { ...state, editingOrderId: action.orderId };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const BookingContext = createContext<{
  state: BookingState;
  dispatch: React.Dispatch<BookingAction>;
}>({ state: initialState, dispatch: () => {} });

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);
  return (
    <BookingContext.Provider value={{ state, dispatch }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  return useContext(BookingContext);
}
