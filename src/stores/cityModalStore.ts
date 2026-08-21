import { create } from "zustand";

interface CityModalState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useCityModalStore = create<CityModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));
