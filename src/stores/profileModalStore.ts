import { create } from "zustand";

export type ProfileTab = "general" | "units" | "cities";

interface ProfileModalState {
  isOpen: boolean;
  activeTab: ProfileTab;
  openModal: (tab?: ProfileTab) => void;
  closeModal: () => void;
  setActiveTab: (tab: ProfileTab) => void;
}

export const useProfileModalStore = create<ProfileModalState>((set) => ({
  isOpen: false,
  activeTab: "general",
  openModal: (tab = "general") => set({ isOpen: true, activeTab: tab }),
  closeModal: () => set({ isOpen: false }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
