import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import CalendarEvent from '../interface/CalendarEvent';

interface TimerState {
	time: number | null;
	break: number | null;
  timeDisplay: string | null;
  task: CalendarEvent | null;
	setDuration: (data: { time: number, break: number }) => void;
	setTimeDisplay: (timeDisplay: string) => void;
  setTask: (task: CalendarEvent) => void;
  clearData: () => void;
}

const useUserStore = create<TimerState>()(
  persist(
    (set) => ({
			time: null,
			break: null,
			timeDisplay: null,
			task: null,
			setDuration: (data) =>
        set({
					time: data.time,
					break: data.break,
					timeDisplay: data.time.toString().padStart(2, '0') + ':00'
        }),
			setTimeDisplay: (timeDisplay) => set({ timeDisplay }),
			setTask: (task: CalendarEvent) => set({ task }),
      clearData: () =>
        set({
					time: null,
					break: null,
					timeDisplay: null,
					task: null,
        }),
    }),
    {
      name: 'timer-storage',
    }
  )
);

export default useUserStore;
