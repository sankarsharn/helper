import { create } from "zustand";
import { User } from "firebase/auth";

type AuthState = {
    user: User | null; // Replaced 'any' with Firebase User type
    role: string | null;
    setUser: (user: User | null) => void; // Replaced 'any' with Firebase User type
    setRole: (role: string) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    role: null,
    setUser: (user) => set({ user }),
    setRole: (role) => set({ role }),
}));