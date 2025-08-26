import { create } from "zustand";

interface SignupState {
  form: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: "USER" | "VENDOR";
    storeName?: string;
    storeAddress?: string;
    businessCategory?: string;
    coverImage?: string;
  };
  setField: (field: string, value: string) => void;
  reset: () => void;
}

export const useSignupStore = create<SignupState>((set) => ({
  form: {
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "USER",
    storeName: "",
    storeAddress: "",
    businessCategory: "",
    coverImage: "",
  },
  setField: (field, value) =>
    set((state) => ({
      form: { ...state.form, [field]: value },
    })),
  reset: () =>
    set({
      form: {
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "USER",
        storeName: "",
        storeAddress: "",
        businessCategory: "",
        coverImage: "",
      },
    }),
}));
