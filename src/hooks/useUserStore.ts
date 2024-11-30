import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  username: string | null;
  email: string | null;
  fullname: string | null;
  avatarUrl: string | null;
	setData: (data: { username: string, email: string, fullname: string, avatarUrl: string }) => void;
  setFullname: (name: string) => void;
  setAvatar: (url: string) => void;
  clearData: () => void;
}

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      username: null,
      email: null,
			fullname: null,
			avatarUrl: null,
			setData: (data) =>
        set({
					username: data.username,
					email: data.email,
					fullname: data.fullname,
					avatarUrl: data.avatarUrl,
        }),
      setFullname: (fullname: string) => set({ fullname }),
			setAvatar: (avatarUrl: string) => set({ avatarUrl }),
      clearData: () =>
        set({
					username: null,
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
