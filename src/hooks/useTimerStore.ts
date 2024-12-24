import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import CalendarEvent from '../interface/CalendarEvent';

interface TimerState {
  timeDisplay: string | null;
  task: CalendarEvent | null;
	setTimeDisplay: (timeDisplay: string) => void;
  setTask: (task: CalendarEvent) => void;
  clearData: () => void;
}

const useUserStore = create<TimerState>()(
  persist(
    (set) => ({
			timeDisplay: null,
			task: null,
			setTimeDisplay: (timeDisplay) => set({ timeDisplay }),
			setTask: (task: CalendarEvent) => set({ task }),
      clearData: () =>
        set({
					timeDisplay: null,
					task: null,
        }),
    }),
    {
      name: 'user-storage',
    }
  )
);

export default useUserStore;
