import {create} from "zustand";

type AuthState = {
    user: any; // Replace 'any' with your User type
    role: string | null;
    setUser: (user: any) => void;
    setRole: (role: string) => void;
  };

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    role: null,
    setUser: (user) => set({ user }),
    setRole: (role) => set({ role }),
  }));