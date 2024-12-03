import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  email: string | null;
  fullname: string | null;
  avatarUrl: string | null;
	setData: (data: { email: string, fullname: string, avatarUrl: string }) => void;
  setFullname: (name: string) => void;
  setAvatar: (url: string) => void;
  clearData: () => void;
}

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      email: null,
			fullname: null,
			avatarUrl: null,
			setData: (data) =>
        set({
					email: data.email,
					fullname: data.fullname,
					avatarUrl: data.avatarUrl,
        }),
      setFullname: (fullname: string) => set({ fullname }),
			setAvatar: (avatarUrl: string) => set({ avatarUrl }),
      clearData: () =>
        set({
					email: null,
					fullname: null,
					avatarUrl: null,
        }),
    }),
    {
      name: 'user-storage',
    }
  )
);

export default useUserStore;
